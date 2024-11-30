from typing import Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    id: int


class UserCreate(BaseModel):
    email: str
    username: str
    bio: str
    password: str


class UserAuth(BaseModel):
    email: str
    password: str


class UserAuthResponse(UserBase):
    token: str
    bio: str



class UserUpdate(UserBase):
    username: str
    bio: str

class UserResponse(UserBase):
    id: int
    username: str
    bio: str

class UserInDBBase(UserBase):
    id: Optional[int] = None
    is_expert: bool
    is_superuser: bool

    class Config:
        from_attributes = True


# Additional properties to return via API
class User(UserInDBBase):
    id: Optional[int] = None


# class UserCreate(BaseModel):
#     username: str
#     email: str
#     password: str
#     is_expert: bool
#
#     class Config:
#         orm_mode = True
