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


class Answer(Base):
    MAX_ANSWER_LENGTH = 10000

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(MAX_ANSWER_LENGTH), nullable=False)
    source = Column(String(10000), nullable=True)
    # Can be NULL, YOUTUBE (for youtube), or LINK
    source_type = Column(String(100), nullable=True)
    likes_count = Column(Integer, default=0)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    question = relationship("Question", back_populates="answers")
    submitter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    shares = relationship("Share", back_populates="answer")
    shares_count = Column(Integer, default=0)
    submitter = relationship("User", back_populates="answers")
    historys = relationship(
        "History", secondary=association_table, back_populates="answers"
    )
    reports = relationship("Report", back_populates="answer")


    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
