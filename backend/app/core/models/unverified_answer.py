from sqlalchemy import (
    Column,
    Computed,
    ForeignKey,
    Index,
    Integer,
    String,
    TypeDecorator,
    UnicodeText,
    Boolean,
    DateTime
)
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship

from .association_tables import association_table
from .base_class import Base
from datetime import datetime


class UnverifiedAnswer(Base):
    MAX_ANSWER_LENGTH = 5000

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(MAX_ANSWER_LENGTH), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
