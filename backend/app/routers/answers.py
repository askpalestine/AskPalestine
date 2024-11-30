from typing import List

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.auth import AuthHandler
from app.core.models.answer import Answer
from app.core.models.answer_like import AnswerLike
from app.core.models.question import Question
from app.core.models.user import User
from app.core.models.share import Share
from app.core.models.report import Report
from app.core.schemas.report import ReportCreate 
from app.core.schemas.answer import AnswerCreate, AnswerResponse
from app.core.schemas.question import QuestionCreate, QuestionResponse
from app.dependencies import get_db

router = APIRouter()

auth_handler = AuthHandler()

limiter = Limiter(key_func=get_remote_address)

@router.get(
    "/{answer_id}/", response_model=AnswerResponse
)
@limiter.limit("5/minute")
def get_answer_by_id(request: Request, answer_id: int, db: Session = Depends(get_db)):
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    return answer

@router.put("/{answer_id}/shared/")
@limiter.limit("5/minute")
def put_shared_answer(
    request: Request,
    answer_id: int,
    share_id: str = "",
    db: Session = Depends(get_db)
):
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    existing_share = db.query(Share).filter_by(answer_id=answer_id, share_id=share_id).first()
    if existing_share:
        raise HTTPException(status_code=400, detail="This answer has already been shared with this share_id")

    new_share = Share(answer_id=answer_id, share_id=share_id)
    db.add(new_share)

    answer.shares_count += 1
    db.commit()

    return {"message": "Answer shared successfully", "shares_count": answer.shares_count}

@router.put("/{answer_id}/report/")
@limiter.limit("5/minute")
def report_answer(
    request: Request,
    answer_id: int,
    report_data: ReportCreate,
    db: Session = Depends(get_db),
):
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    new_report = Report(
        text=report_data.text,
        answer_id=answer_id,
    )
    db.add(new_report)
    db.commit()

    return {"message": "Report submitted successfully"}