from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    func
)
from sqlalchemy.orm import relationship
from .base_class import Base
from datetime import datetime
import uuid

class Share(Base):
    __tablename__ = 'shares'

    id = Column(Integer, primary_key=True, index=True)
    share_id = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    answer_id = Column(Integer, ForeignKey("answers.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    answer = relationship("Answer", back_populates="shares")
