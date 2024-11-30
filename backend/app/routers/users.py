import os
from typing import List
from datetime import datetime
import uuid

from fastapi import Form, UploadFile, File
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi.responses import Response
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import TypeAdapter, ValidationError, parse_obj_as
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import app.crud as crud
from app.auth import AuthHandler
from app.core.schemas.user import (
    User,
    UserAuth,
    UserAuthResponse,
    UserResponse,
    UserCreate,
    UserUpdate,
)
from app.core.models.user import User as UserModel
from app.dependencies import get_db

router = APIRouter()
auth_handler = AuthHandler()
limiter = Limiter(key_func=get_remote_address)
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "email@gmail.com"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "password"),
    MAIL_FROM = "askpalestineinfo@gmail.com",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_FROM_NAME="Ask Palestine",
    USE_CREDENTIALS = True,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    VALIDATE_CERTS=True
)

@router.post("/", status_code=201, response_model=User)
@limiter.limit("4/minute")
async def register_user(
        request: Request,
        email: str = Form(...),
        username: str = Form(...),
        bio: str = Form(...),
        password: str = Form(...),
        file: UploadFile = File(...),
        db: Session = Depends(get_db)):
    existing_user = crud.user.get_by_username(db=db, username=username)
    if existing_user and existing_user.is_email_verified:
        raise HTTPException(status_code=400, detail="This username is already used")
    existing_user = crud.user.get_by_email(db=db, email=email)
    if existing_user and existing_user.is_email_verified:
        raise HTTPException(status_code=400, detail="This email is already registered")
    contents = await file.read()
    # 2 MB limit
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")

    # hash and override password
    password = auth_handler.get_password_hash(password)
    user = None
    if existing_user:
        user = existing_user
    else:
        user = UserModel()
    user.photo = contents
    user.username = username
    user.email = email
    user.password = password
    user.bio = bio
    user.is_email_verified = False
    user.is_expert = False
    user.is_superuser = False

    verification_token = uuid.uuid4().hex

    # Set the token and the timestamp
    user.email_verification_token = verification_token
    user.email_verification_sent_at = datetime.utcnow()


    # Send verification email
    domain = os.getenv("BACKEND_BASE_URL", "http://localhost:3000/api")
    message = None
    try:
        message = MessageSchema(
        subject="Email Verification | Ask Palestine",
        recipients=[email],
        body=f"Please click on the link to verify your email: {domain}/users/verify/{verification_token}/",
        subtype="html"
    )
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid email")
    
    db.add(user)
    db.commit()

    print(f"Verify email at {domain}/users/verify/{verification_token}/")
    try:
        if os.getenv("APP_ENV", "development") == "production":
            fm = FastMail(conf)
            await fm.send_message(message)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Couldn't send verification email")
    return user

@router.get("/verify/{token}/", status_code=200)
@limiter.limit("2/minute")
def verify_email(request: Request, token: str, db: Session = Depends(get_db)):
    user = crud.user.get_by_verification_token(db=db, verification_token=token)
    if not user:
        raise HTTPException(status_code=404, detail="Invalid token or token has expired")
    if user.is_email_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")
    
    user.is_email_verified = True
    user.email_verification_token = None
    db.commit()
    return {"message": "Your email has been successfully verified. Once we have reviewed and verified the details in your bio, you will receive an email to confirm your account's expert status. Only after this confirmation will you be able to log in. We thank you for your patience."}

@router.get("/{username}/", response_model=UserResponse)
@limiter.limit("100/minute")
def get_user(request: Request, username: str, db: Session = Depends(get_db)):
    user = crud.user.get_by_username(db=db, username=username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return user

@router.post("/login/", status_code=200, response_model=UserAuthResponse)
@limiter.limit("2/minute")
def login(
    user_details: UserAuth,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = crud.user.get_by_email(
        db=db, email=user_details.email
    )
    if not current_user or not auth_handler.verify_password(
        user_details.password, current_user.password
    ):
        raise HTTPException(
            status_code=401, detail="Invalid email or password"
        )
    if not current_user.is_email_verified:
        raise HTTPException(
            status_code=401, detail="Email is not verified"
        )
    if not current_user.is_expert:
        raise HTTPException(
            status_code=401, detail="Account expertise has not yet been verified"
        )
    token = auth_handler.encode_token(current_user.id, current_user.username, current_user.email)

    return UserAuthResponse(token=token, id=current_user.id, bio=current_user.bio, username=current_user.username)


photo_cache = {}

@router.get("/photo/{username}", response_class=Response)
@limiter.limit("500/minute")
def get_user_photo(request: Request, username: str, db: Session = Depends(get_db)):
    if username in photo_cache:
        return Response(content=photo_cache[username], media_type="image/png")

    user = crud.user.get_by_username(db=db, username=username)
    if not user or not user.photo:
        raise HTTPException(status_code=404, detail="User or photo not found")
    
    photo_cache[username] = user.photo
    return Response(content=user.photo, media_type="image/png")


# Example protected route
@router.get("/test_protected/", status_code=200)
def protected_route(
    *,
    request: Request,
    db: Session = Depends(get_db),
    authenticatedUser=Depends(auth_handler.auth_wrapper)
):
    """
    Example protected route: you will need to add the token returned after logging in to the headers as a bearer token
    e.g.
    curl --location 'http://localhost:8000/users/test_protected' --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTgxMTE2MTcsImlhdCI6MTY5ODAyNTIxNywic3ViIjoidGVzdFVzZXIifQ.fAsppv1zBxfmm4HUpwVtik9ySUmWJCLt4j1oTTGP4WE'
    """
    return authenticatedUser


# Example unprotected route
@router.get("/test_unprotected/", status_code=200)
def unprotected_route(*, request: Request, db: Session = Depends(get_db)):
    return {"hello": "world"}
