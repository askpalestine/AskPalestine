# Pull base image
FROM python:3.11-buster

RUN pip install poetry==1.6.1

# Set environment varibles
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=false \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /code
COPY pyproject.toml poetry.lock alembic.ini .env ./
COPY app ./app
COPY alembic ./almebic

# Install dependencies
RUN poetry install