from typing import List

from pydantic import BaseModel

from .tag import Tag


class Question(BaseModel):
    id: int
    question_forms: List[str]
    answers: List["Answer"] = []  # Forward declaration

    class Config:
        from_attributes = True


class QuestionUpdate(Question):
    ...


class QuestionCreate(BaseModel):
    text: str
    tags: List[str] = []

    class Config:
        from_attributes = True


class QuestionListItemResponse(BaseModel):
    id: int
    question_forms: List[str]
    views_count: int
    answers: List["AnswerInQuestionList"] = []  # Forward declaration

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    id: int
    next_id: int
    question_forms: List[str]
    views_count: int
    answers: List["AnswerInQuestionResponse"] = []  # Forward declaration

    class Config:
        from_attributes = True

class TagWithQuestionIDsResponse(BaseModel):
    id: int
    name: str
    question_ids: List[int]

from .answer import Answer, AnswerInQuestionResponse
from .answer import AnswerInQuestionList

Question.model_rebuild()
QuestionResponse.model_rebuild()
QuestionListItemResponse.model_rebuild()
