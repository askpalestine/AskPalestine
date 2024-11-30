from typing import List

from pydantic import BaseModel


class Tag(BaseModel):
    name: str

    class Config:
        from_attributes = True
