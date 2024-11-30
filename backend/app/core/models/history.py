from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .association_tables import association_table
from .base_class import Base


class History(Base):
    id = Column(Integer, primary_key=True, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    title = Column(String, index=True, nullable=False)
    text = Column(String, index=True, nullable=False)
    submitter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    submitter = relationship("User", back_populates="histories")
    answers = relationship(
        "Answer", secondary=association_table, back_populates="historys"
    )
