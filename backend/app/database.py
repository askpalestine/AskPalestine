import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# TODO(issues/11) - Connect to DB using SSL
database_url = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres"
)

app_env = os.getenv("APP_ENV", "development")

# Load the appropriate .env file based on the environment
if app_env == "production":
    engine = create_engine(database_url)
else:
    engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
