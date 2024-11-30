from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import app.crud as crud
from app.auth import AuthHandler
from app.core.schemas.history import History, HistoryCreate
from app.dependencies import get_db

router = APIRouter()
auth_handler = AuthHandler()
limiter = Limiter(key_func=get_remote_address)

@router.post("/", status_code=201, response_model=History)
@limiter.limit("5/minute")
def create_history(
    request: Request,
    history_in: HistoryCreate,
    db: Session = Depends(get_db),
    authenticatedUser=Depends(auth_handler.auth_wrapper),
):
    history_obj = crud.history.create(db=db, obj_in=history_in)
    return history_obj


@router.get("/", status_code=200, response_model=List[History])
@limiter.limit("5/minute")
def fetch_history(*, request: Request, db: Session = Depends(get_db)):
    history_list = crud.history.get_multi(db=db)
    return history_list
