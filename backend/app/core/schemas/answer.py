from typing import List, Optional

from pydantic import BaseModel
from typing import Optional

from app.core.schemas.history import History
from app.core.schemas.user import User, UserResponse


class Answer(BaseModel):
    id: int
    text: str
    question_id: int
    submitter_id: int
    likes_count: int
    submitter: User
    shares_count: int
    historys: List["History"] = []

    class Config:
        from_attributes = True

class AnswerInQuestionResponse(BaseModel):
    id: int
    text: str
    source: Optional[str]
    source_type: Optional[str]
    question_id: int
    submitter_id: int
    likes_count: int
    submitter: UserResponse
    shares_count: int

    class Config:
        from_attributes = True

class AnswerInQuestionList(BaseModel):
    id: int
    question_id: int
    submitter_id: int
    submitter: UserResponse
    shares_count: int

    class Config:
        from_attributes = True
class AnswerUpdate(Answer):
    ...


class AnswerCreate(BaseModel):
    text: str

    class Config:
        from_attributes = True


class AnswerResponse(BaseModel):
    id: int
    text: str
    question_id: int
    submitter_id: int
    likes_count: int
    submitter: User
    historys: List["History"] = []

    class Config:
        from_attributes = True
