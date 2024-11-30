from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from .base_class import Base
from datetime import datetime

class Report(Base):
    MAX_REPORT_LENGTH = 5000 

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(MAX_REPORT_LENGTH), nullable=False)
    answer_id = Column(Integer, ForeignKey("answers.id", ondelete="CASCADE"), nullable=False)
    answer = relationship("Answer", back_populates="reports")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

