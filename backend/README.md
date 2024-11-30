
## Running the backend
This is a python project using Fast Api.

The project dockerised, and has a postgres volume attached.

In the backend repo run:

1. Build using: `docker-compose build`

2. Ensure all migrations have been created using:
`docker-compose run web alembic revision --autogenerate -m "<YOUR MESSAGE>"`

3. Run Migrations:`docker-compose run web alembic upgrade head`
4. Run the application: `docker-compose up`
5. Access the site at <a>localhost:3000</a>

**Swagger Docs:** <a>localhost:3000/docs</a>

N.B. You can access a pgadmin to view the tables via <a>localhost:5050</a>
Username: pgadmin4@pgadmin.org 
Pass: admin

