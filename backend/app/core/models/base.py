# Import all models for ease for Alembic

from app.core.models.answer import Answer
from app.core.models.answer_like import AnswerLike
from app.core.models.association_tables import association_table
from app.core.models.base_class import Base
from app.core.models.history import History
from app.core.models.question import Question
from app.core.models.question_tags import question_tags_association
from app.core.models.tag import Tag
from app.core.models.user import User
from app.core.models.subscription import Subscription
from app.core.models.share import Share
from app.core.models.unverified_answer import UnverifiedAnswer
from app.core.models.report import Report