from pydantic import BaseModel

class SubscriptionCreate(BaseModel):
    email: str