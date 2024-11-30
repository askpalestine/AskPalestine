from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.schemas.subscription import SubscriptionCreate 
from app.dependencies import get_db
from app.core.models.subscription import Subscription

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/subscribe/", status_code=201)
@limiter.limit("1/hour")
def create_subscription(request: Request, subscription_data: SubscriptionCreate, db: Session = Depends(get_db)):
    db_subscription = db.query(Subscription).filter(Subscription.email == subscription_data.email).first()
    if db_subscription:
        raise HTTPException(status_code=400, detail="Email already subscribed")

    new_subscription = Subscription(email=subscription_data.email)
    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)

    return {"message": "Subscription successful!", "subscription": new_subscription}