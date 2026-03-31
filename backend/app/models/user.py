from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    email: str
    full_name: str
    password_hash: str
    role: str = "user"  # admin, supervisor, user
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
