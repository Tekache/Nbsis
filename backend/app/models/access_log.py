from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AccessLog(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    personnel_id: str
    access_point: str
    access_type: str  # entry, exit
    status: str  # granted, denied
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    reason_if_denied: Optional[str] = None
    camera_id: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
