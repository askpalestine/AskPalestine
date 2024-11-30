from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.auth import AuthHandler
from app.core.models.user import User
from app.core.schemas.user import UserCreate, UserUpdate
from app.crud.base import CRUDBase

auth_handler = AuthHandler()


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_by_verification_token(self, db: Session, *, verification_token: str) -> Optional[User]:
        return db.query(User).filter(User.email_verification_token == verification_token).first()
    
    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 300):
        return db.query(self.model).offset(skip).limit(limit).all()

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        return super().update(db, db_obj=db_obj, obj_in=obj_in)


user = CRUDUser(User)
