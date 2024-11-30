from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    Sequence,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .base_class import Base


class AnswerLike(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    answer_id = Column(Integer, ForeignKey("answers.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="answer_likes")

    __table_args__ = (
        UniqueConstraint("user_id", "answer_id", name="uix_user_answer_like"),
    )
