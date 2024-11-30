from app.core.models.question import Question
from app.core.schemas.question import QuestionCreate, QuestionUpdate
from app.crud.base import CRUDBase


class CRUDQuestion(CRUDBase[Question, QuestionCreate, QuestionUpdate]):
    ...


question = CRUDQuestion(Question)
