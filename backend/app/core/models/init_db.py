import logging

from sqlalchemy.orm import Session

from app import crud
from app.core import schemas
from app.core.models import base  # noqa: F401

logger = logging.getLogger(__name__)

FIRST_SUPERUSER = "admin@recipeapi.com"


def init_db(db: Session) -> None:  # 1
    if FIRST_SUPERUSER:
        user = crud.user.get_by_email(db, email=FIRST_SUPERUSER)  # 2
        if not user:
            user_in = schemas.UserCreate(
                full_name="Initial Super User",
                email=FIRST_SUPERUSER,
                is_superuser=True,
            )
            user = crud.user.create(db, obj_in=user_in)
        else:
            logger.warning(
                "Skipping creating superuser. User with email "
                f"{FIRST_SUPERUSER} already exists. "
            )
        if not user.recipes:
            for recipe in RECIPES:
                recipe_in = schemas.RecipeCreate(
                    label=recipe["label"],
                    source=recipe["source"],
                    url=recipe["url"],
                    submitter_id=user.id,
                )
                crud.recipe.create(db, obj_in=recipe_in)  # 3
