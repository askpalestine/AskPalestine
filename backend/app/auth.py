from datetime import datetime, timedelta

import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext


class AuthenticatedUser:
    def __init__(self, id: int, username: str):
        self.id = id
        self.username = username


class AuthHandler:
    security = HTTPBearer()
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    secret = "TempSecret"

    def get_password_hash(self, password: str):
        """
        Hash plain text passed
        Args:
            password: str - plain text password

        """
        print(type(self.pwd_context.hash(password)))
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def encode_token(self, id, username, email):
        payload = {
            "exp": datetime.utcnow() + timedelta(days=1),  # token expiry time
            "iat": datetime.utcnow(),  # issued at time
            "id": id,
            "username": username,
            "email": email,
        }
        return jwt.encode(payload, self.secret, algorithm="HS256")

    def decode_token(self, token):
        try:
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            return AuthenticatedUser(
                id=payload["id"], username=payload["username"]
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401, detail="Signature has expired"
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail="Invalid token")

    # Dependency injection wrapper. this should be added to all routes that need to be protected
    def auth_wrapper(
        self, auth: HTTPAuthorizationCredentials = Security(security)
    ):
        return self.decode_token(auth.credentials)
