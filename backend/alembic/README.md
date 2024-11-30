# Alembic
Note: If you want to run against the production DB, change all the ocurrences of .env to .env.prod in the following commands:

* To create a new revision python -m dotenv -f .env run alembic revision --autogenerate -m "Initial revision"
* To apply revision changes: python -m dotenv -f .env run alembic upgrade head