from sqlalchemy import (
    Column,
    Computed,
    Index,
    Integer,
    String,
    Boolean,
    DateTime
)
from sqlalchemy.dialects.postgresql import ARRAY, TSVECTOR
from sqlalchemy.orm import relationship
from datetime import datetime

from .base_class import Base
from .question_tags import question_tags_association  # Import the association table


class Question(Base):
    MAX_QUESTION_LENGTH = 300

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(MAX_QUESTION_LENGTH), nullable=False)
    question_forms = Column(ARRAY(String))  # New column for list of strings
    answers = relationship("Answer", back_populates="question", cascade="all,delete,delete-orphan",)
    tags = relationship("Tag", secondary=question_tags_association, back_populates="questions")
    is_accepted = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    question__ts_vector__ = Column(
        TSVECTOR(), Computed("to_tsvector('english', text)", persisted=True)
    )
    __table_args__ = (
        Index(
            "question_text___ts_vector__",
            question__ts_vector__,
            postgresql_using="gin",
        ),
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
