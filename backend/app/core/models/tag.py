from sqlalchemy import Table, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base_class import Base
from .question_tags import question_tags_association  # Import the association table

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    questions = relationship("Question", secondary=question_tags_association, back_populates="tags")
