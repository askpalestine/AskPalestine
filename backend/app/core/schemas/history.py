from datetime import date
from typing import Optional

from pydantic import BaseModel


class HistoryBase(BaseModel):
    title: str
    text: str
    start_date: date
    end_date: Optional[date]


class HistoryCreate(HistoryBase):
    ...


class HistoryUpdate(HistoryBase):
    ...


class HistoryInDBBase(HistoryBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


# Additional properties to return via API
class History(HistoryInDBBase):
    pass
