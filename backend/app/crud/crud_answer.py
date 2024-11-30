from app.core.models.answer import Answer
from app.core.schemas.answer import AnswerCreate, AnswerUpdate
from app.crud.base import CRUDBase


class CRUDAnswer(CRUDBase[Answer, AnswerCreate, AnswerUpdate]):
    ...


answer = CRUDAnswer(Answer)
