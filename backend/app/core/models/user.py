from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    Sequence,
    String,
    create_engine,
    DateTime,
    LargeBinary
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from .base_class import Base
from datetime import datetime


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    bio = Column(String(2000), nullable=True)
    password = Column(String(128))
    is_expert = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    photo = Column(LargeBinary, nullable=True)

    answers = relationship(
        "Answer",
        cascade="all,delete,delete-orphan",
        back_populates="submitter",
    )
    histories = relationship(
        "History",
        cascade="all,delete,delete-orphan",
        back_populates="submitter",
    )
    answer_likes = relationship(
        "AnswerLike",
        cascade="all,delete,delete-orphan",
        back_populates="user",
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(128), nullable=True)