import logging
import openai

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.routers.answers import router as answers_router
from app.routers.historys import router as history_router
from app.routers.questions import router as questions_router
from app.routers.users import router as users_router
from app.routers.subscriptions import router as subscriptions_router
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.routers.subscriptions import router as subscriptions_router
from app.routers.stats import router as stats_router

# Load environment variables from .env file
load_dotenv()

origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost",

    "http://www.askpalestine.info:80",
    "http://www.askpalestine.info",
    "https://www.askpalestine.info",
    "http://askpalestine.info",
    "https://askpalestine.info",

    "http://www.palestineqa.com",
    "https://www.palestineqa.com",
    "http://palestineqa.com",
    "https://palestineqa.com",

    "https://frontend-service-test-s4bda6la5q-lz.a.run.app"
]

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*']
    )
]

app = FastAPI(middleware=middleware,docs_url="/api/docs", redoc_url="/api/redoc", openapi_prefix="/api")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    response = JSONResponse(
        {"detail": f"Rate limit exceeded: {exc.detail}"}, status_code=429
    )
    response = request.app.state.limiter._inject_headers(
        response, request.state.view_rate_limit
    )
    return response
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

@app.get("/api/openapi.json", include_in_schema=False)
@limiter.limit("1/hour") 
async def custom_openapi(request: Request):
    return get_openapi(
        title="Custom OpenAPI",
        version="1.0.0",
        description="This is a custom OpenAPI JSON",
        routes=app.routes,
    )

@app.get("/api/home/", status_code=200)
def read_root():
    return {"Hello": "World"}


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.include_router(questions_router, prefix="/api/questions", tags=["questions"])
app.include_router(answers_router, prefix="/api/answers", tags=["answers"])
app.include_router(history_router, prefix="/api/history", tags=["history"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(stats_router, prefix="/api/stats", tags=["stats"])
app.include_router(subscriptions_router, prefix="/api", tags=["subscriptions"])


if __name__ == "__main__":
    # Use this for debugging purposes only
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
