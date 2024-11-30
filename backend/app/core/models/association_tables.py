from sqlalchemy import Column, ForeignKey, Integer, Table
from sqlalchemy.orm import relationship

from .base_class import Base

# Base = declarative_base()
association_table = Table(
    "answer_history_association",
    Base.metadata,
    Column("history_id", Integer, ForeignKey("historys.id"), primary_key=True),
    Column("answer_id", Integer, ForeignKey("answers.id"), primary_key=True),
)
