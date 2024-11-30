import os
from typing import List
import uuid
from datetime import datetime, timedelta

from fastapi import Form, UploadFile, File
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi.responses import Response
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import TypeAdapter, ValidationError, parse_obj_as
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy import func

import app.crud as crud
from app.auth import AuthHandler
from app.core.models.user import User
from app.core.models.answer import Answer
from app.core.models.question import Question
from app.dependencies import get_db

router = APIRouter()
auth_handler = AuthHandler()
limiter = Limiter(key_func=get_remote_address)


# In-memory cache variables
accepted_questions_cache = None
accepted_questions_timestamp = None

answers_cache = None
answers_timestamp = None

usernames_cache = None
usernames_timestamp = None

total_views_cache = None
total_views_timestamp = None


@router.get("/accepted_questions_count/")
@limiter.limit("100/minute")
def get_accepted_questions_count(request: Request, db: Session = Depends(get_db)):
    global accepted_questions_cache, accepted_questions_timestamp

    # Check if the cache is valid (less than 2 days old)
    if accepted_questions_cache and accepted_questions_timestamp and datetime.now() - accepted_questions_timestamp < timedelta(days=2):
        # If valid cache exists, return it
        return {"accepted_questions_count": accepted_questions_cache}
    # If no valid cache, calculate the count
    accepted_question_forms = (db.query(Question.question_forms)
                               .filter(Question.is_accepted == True)
                               .all())
    accepted_questions_count = sum(
        len(question_forms[0]) for question_forms in accepted_question_forms)

    # Cache the result and the timestamp
    accepted_questions_cache = accepted_questions_count
    accepted_questions_timestamp = datetime.now()

    return {"accepted_questions_count": accepted_questions_count}


@router.get("/answers_count/")
@limiter.limit("100/minute")
def get_answers_count(request: Request, db: Session = Depends(get_db)):
    global answers_cache, answers_timestamp

    # Check if the cache is valid (less than 2 days old)
    if answers_cache and answers_timestamp and datetime.now() - answers_timestamp < timedelta(days=2):
        # If valid cache exists, return it
        return {"answers_count": answers_cache}

    # If no valid cache, calculate the count
    answers_count = db.query(Answer).count()

    # Cache the result and the timestamp
    answers_cache = answers_count
    answers_timestamp = datetime.now()

    return {"answers_count": answers_count}


@router.get("/usernames/")
@limiter.limit("100/minute")
def get_usernames(request: Request, db: Session = Depends(get_db)):
    global usernames_cache, usernames_timestamp

    # Check if the cache is valid (less than 2 days old)
    if usernames_cache and usernames_timestamp and datetime.now() - usernames_timestamp < timedelta(days=2):
        # If valid cache exists, return it
        return {"usernames": usernames_cache}

    # If no valid cache, get the list of usernames
    usernames = [user.username for user in db.query(User.username).all()]

    # Cache the result and the timestamp
    usernames_cache = usernames
    usernames_timestamp = datetime.now()

    return {"usernames": usernames}


@router.get("/total_views_count/")
@limiter.limit("100/minute")
def get_total_views_count(request: Request, db: Session = Depends(get_db)):
    global total_views_cache, total_views_timestamp

    # Check if the cache is valid (less than 2 days old)
    if total_views_cache and total_views_timestamp and datetime.now() - total_views_timestamp < timedelta(days=2):
        # If valid cache exists, return it
        return {"total_views_count": total_views_cache}

    # If no valid cache, calculate the total views count
    total_views_count = db.query(func.sum(Question.views_count)).scalar() or 0

    # Cache the result and the timestamp
    total_views_cache = total_views_count
    total_views_timestamp = datetime.now()

    return {"total_views_count": total_views_count}
