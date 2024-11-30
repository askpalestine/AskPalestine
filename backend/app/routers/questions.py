from typing import List, Optional
import os
from openai import OpenAI

from fastapi import APIRouter, Depends, HTTPException, Response, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta

import app.crud as crud
from app.auth import AuthHandler
from app.core.models.answer import Answer
from app.core.models.unverified_answer import UnverifiedAnswer
from app.core.models.question import Question
from app.core.models.question_tags import question_tags_association
from app.core.models.tag import Tag
from app.core.models.user import User
from app.core.schemas.answer import AnswerCreate, AnswerInQuestionList, AnswerInQuestionResponse
from app.core.schemas.question import QuestionCreate, QuestionResponse, QuestionListItemResponse, TagWithQuestionIDsResponse
from app.core.schemas.user import UserResponse
from app.dependencies import get_db
from sqlalchemy.orm import joinedload, Session
from sqlalchemy import func, text

from datetime import datetime, timedelta

from app.google_policy_complier import complyText, complyTextArray

router = APIRouter()
auth_handler = AuthHandler()
limiter = Limiter(key_func=get_remote_address)


@router.get("/tags/", )
@limiter.limit("500/minute")
async def get_tags_with_questions(request: Request, db: Session = Depends(get_db)):
    tags = db.query(Tag).options(joinedload(Tag.questions)).all()

    # Construct the response
    response = []
    for tag in tags:
        tag_response = TagWithQuestionIDsResponse(
            id=tag.id,
            name=tag.name,
            question_ids=[question.id for question in tag.questions]
        )
        response.append(tag_response)

    return response

# In-memory cache
questions_cache = None
questions_cache_timestamp = None

@router.get("/", response_model=List[QuestionListItemResponse])
@limiter.limit("100/minute")
async def list_questions(
    request: Request,
    db: Session = Depends(get_db),
    answered: Optional[bool] = None,
    filter_text: Optional[str] = None,
    tag: Optional[str] = None,
    is_android: Optional[bool] = None,
):
    global questions_cache, questions_cache_timestamp
    # Check if the cache is valid (less than 2 days old)
    if questions_cache and questions_cache_timestamp and datetime.now() - questions_cache_timestamp < timedelta(days=2):
        # If valid cache exists, return it
        return JSONResponse(content=questions_cache)

    query = db.query(Question).options(
        joinedload(Question.answers).joinedload(
            Answer.submitter).load_only(User.id, User.username)
    ).filter(Question.is_accepted == True)
    if answered is not None:
        query = query.filter(Question.answers.any()
                             if answered else ~Question.answers.any())
    if filter_text is not None:
        terms = filter_text.split()
        # Adding ':*' to each term for prefix matching
        prefixed_terms = [f"{term}:*" for term in terms]
        query_string = ' & '.join(prefixed_terms)
        ts_query = func.to_tsquery('english', query_string)
        print(ts_query)
        query = query.filter(Question.question__ts_vector__.op('@@')(ts_query))
    if tag is not None:
        query = (query.join(
            question_tags_association,
            Question.id == question_tags_association.c.question_id,
        )
            .filter(Question.is_accepted == True)
            .join(Tag, Tag.id == question_tags_association.c.tag_id)
            .filter(Tag.name == tag))

    result = query.all()
    data = list(map(lambda question: QuestionListItemResponse(
        id=question.id,
        question_forms=complyTextArray(question.question_forms) if (
                is_android is not None and is_android) else question.question_forms,
        views_count=question.views_count,
        answers=list(map(lambda answer: AnswerInQuestionList(
            id=answer.id,
            question_id=answer.question_id,
            submitter_id=answer.submitter_id,
            submitter=UserResponse(
                id=answer.submitter.id,
                username=answer.submitter.username,
                bio=answer.submitter.bio,
            ),
            shares_count=answer.shares_count,
        ), question.answers)),
    ), result))
    serializable_data = [item.dict() for item in data]

    # Cache the data and the timestamp
    questions_cache = serializable_data
    questions_cache_timestamp = datetime.now()
    response = JSONResponse(content=serializable_data)

    return response


@router.get("/search/", response_model=List[QuestionListItemResponse])
@limiter.limit("10/minute")
async def search_questions_by_text(
    request: Request,
    db: Session = Depends(get_db),
    search_text: Optional[str] = None,
    is_android: Optional[bool] = None,
):
    if search_text is None or len(search_text.split()) < 3 or len(search_text.split()) > 20 or len(search_text) > 200:
        raise HTTPException(status_code=400, detail="Invalid search_text. It should be at least 3 words and not exceed 20 words and not exceed 200 characters.")

    similar_questions = find_most_similar_questions(db, search_text, 5)
    print(similar_questions)
    query = db.query(Question).options(
        joinedload(Question.answers).joinedload(
            Answer.submitter).load_only(User.id, User.username)
    ).filter(Question.is_accepted == True)

    if (len(similar_questions) > 0):
        query = query.filter(Question.id.in_(similar_questions))
    else:
        # Fallback to tsvectors
        terms = search_text.split()
        # Adding ':*' to each term for prefix matching
        prefixed_terms = [f"{term}:*" for term in terms]
        query_string = ' & '.join(prefixed_terms)
        ts_query = func.to_tsquery('english', query_string)
        query = query.filter(Question.question__ts_vector__.op('@@')(ts_query))

    result = query.all()

    data = list(map(lambda question: QuestionListItemResponse(
        id=question.id,
        question_forms=complyTextArray(question.question_forms) if (
                is_android is not None and is_android) else question.question_forms,
        views_count=question.views_count,
        answers=list(map(lambda answer: AnswerInQuestionList(
            id=answer.id,
            question_id=answer.question_id,
            submitter_id=answer.submitter_id,
            submitter=UserResponse(
                id=answer.submitter.id,
                username=answer.submitter.username,
                bio=answer.submitter.bio,
            ),
            shares_count=answer.shares_count,
        ), question.answers)),
    ), result))

    # Sort by position in the similar_questions list
    if (len(similar_questions) > 0):
        question_position = {id: index for index, id in enumerate(similar_questions)}
        print(question_position)
        data = sorted(data, key=lambda item: question_position.get(item.id, float('inf')))

    serializable_data = [item.dict() for item in data]
    response = JSONResponse(content=serializable_data)

    return response


def find_most_similar_questions(db: Session, search_text: str, limit: int):
    embedding = get_text_embedding(search_text)
    if embedding is None:
        return []

    query_str = f"""
        SELECT question_id
        FROM (
            SELECT DISTINCT ON (question_id) question_id, embedding
            FROM question_form_embeddings
            ORDER BY question_id, embedding <-> CAST(:embedding AS vector)
        ) AS subquery
        ORDER BY embedding <-> CAST(:embedding AS vector)
        LIMIT :limit;
    """

    result = db.execute(
        text(query_str),
        {"embedding": embedding, "limit": limit}
    ).fetchall()

    return [item[0] for item in result]


def get_text_embedding(text: str):
    client = OpenAI()
    try:
        response = client.embeddings.create(
            input=[text],
            model="text-embedding-3-small",
            dimensions=1536,
        )
        embedding = response.data[0].embedding
        return embedding
    except Exception as e:
        print(e)
        return None


def increment_question_views(db: Session, question_id: int):
    question = db.query(Question).filter(Question.id == question_id).first()
    if question:
        question.views_count += 1
        db.commit()


@router.get(
    "/{question_id}/", response_model=QuestionResponse
)
@limiter.limit("200/minute")
def get_question_by_id(
    request: Request,
    background_tasks: BackgroundTasks,
    question_id: int,
    prefetch: bool = False,
    is_expert: bool = False,
    db: Session = Depends(get_db),
    is_android: Optional[bool] = None,
):
    question = db.query(Question).filter(
        Question.id == question_id, Question.is_accepted == True).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    answers = (db.query(Answer)
               .join(User, User.id == Answer.submitter_id)
               .where(User.is_expert == is_expert, Answer.question_id == question_id)
               .order_by(Answer.likes_count.desc()))

    # Note this will disregard questions with the same views_count.
    next_question = (db.query(Question)
                     .filter(Question.views_count < question.views_count, Question.is_accepted == True)
                     .order_by(Question.views_count.desc())
                     .first())

    if not next_question:
        next_question = (db.query(Question)
                         .filter(Question.is_accepted == True)
                         .order_by(Question.views_count.desc())
                         .first())

    if not prefetch:
        background_tasks.add_task(
            increment_question_views, db=db, question_id=question_id)

    return QuestionResponse(
        id=question.id,
        next_id=next_question.id,
        question_forms=complyTextArray(question.question_forms) if (
            is_android is not None and is_android) else question.question_forms,
        views_count=question.views_count,
        answers=[AnswerInQuestionResponse(
            id=answer.id,
            text=complyText(answer.text) if (
                 is_android is not None and is_android) else answer.text,
            source=answer.source,
            source_type=answer.source_type,
            question_id=answer.question_id,
            submitter_id=answer.submitter_id,
            likes_count=answer.likes_count,
            submitter=UserResponse(
                id=answer.submitter.id,
                username=answer.submitter.username,
                bio=answer.submitter.bio,
            ),
            shares_count=answer.shares_count,
        ) for answer in answers]
    )


@router.post("/")
@limiter.limit("100/hour")
def create_question(
    request: Request,
    question: QuestionCreate,
    db: Session = Depends(get_db),
):

    if (len(question.text) > Question.MAX_QUESTION_LENGTH):
        raise HTTPException(
            status_code=400, detail=f"Question too long. Maximum allowed length is {Question.MAX_QUESTION_LENGTH} characters.")

    db_question = Question(
        text=question.text,
        question_forms=[question.text],
    )
    db.add(db_question)
    db.commit()

    for tag_name in question.tags:
        # Check if tag exists
        db_tag = db.query(Tag).filter(Tag.name == tag_name).first()

        if not db_tag:
            db_tag = Tag(name=tag_name)
            db.add(db_tag)
            db.commit()
            db.refresh(db_tag)

        db.execute(
            question_tags_association.insert().values(
                question_id=db_question.id, tag_id=db_tag.id
            )
        )
        db.commit()

    db.refresh(db_question)
    return db_question


@router.post("/{question_id}/answer/", status_code=201)
@limiter.limit("10/minute")
def answer_question(
    request: Request,
    question_id: int,
    answer: AnswerCreate,
    db: Session = Depends(get_db),
    authenticatedUser=Depends(auth_handler.auth_wrapper),
):

    if (len(answer.text) > Answer.MAX_ANSWER_LENGTH):
        raise HTTPException(
            status_code=400, detail=f"Answer too long. Maximum allowed length is {Answer.MAX_ANSWER_LENGTH} characters.")

    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Check if the user exists
    db_user = db.query(User).filter(User.id == authenticatedUser.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_answer = Answer(
        text=answer.text,
        question_id=question_id,
        submitter_id=authenticatedUser.id,
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)

    return db_answer


@router.post("/{question_id}/answer/unverified", status_code=201)
@limiter.limit("10/minute")
def answer_question_unverified(
    request: Request,
    question_id: int,
    answer: AnswerCreate,
    db: Session = Depends(get_db),
):

    if (len(answer.text) > Answer.MAX_ANSWER_LENGTH):
        raise HTTPException(
            status_code=400, detail=f"Answer too long. Maximum allowed length is {Answer.MAX_ANSWER_LENGTH} characters.")

    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    db_answer = UnverifiedAnswer(
        text=answer.text,
        question_id=question_id,
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)

    return db_answer


@router.get("/user/{username}/", response_model=List[QuestionResponse])
@limiter.limit("10/minute")
def get_questions_by_user(
    request: Request,
    username: str,
    db: Session = Depends(get_db),
    is_android: Optional[bool] = None,
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    answers = db.query(Answer).filter(Answer.submitter_id == user.id).all()
    question_ids = {answer.question_id for answer in answers}

    # Fetch the corresponding questions and construct the response
    questions = db.query(Question).filter(Question.id.in_(question_ids))
    data = []
    for question in questions.all():
        question_response = QuestionResponse(
            next_id=0,
            views_count=question.views_count,
            id=question.id,
            question_forms=complyTextArray(question.question_forms) if (
                is_android is not None and is_android) else question.question_forms,
            answers=[],
        )
        data.append(question_response)

    serializable_data = [item.dict() for item in data]
    response = JSONResponse(content=serializable_data)

    return response
