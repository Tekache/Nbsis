from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AccessLogCreate(BaseModel):
    personnel_id: str
    access_point: str
    access_type: str
    status: str
    reason_if_denied: Optional[str] = None
    camera_id: Optional[str] = None

class AccessLogResponse(BaseModel):
    id: Optional[str] = None
    personnel_id: str
    access_point: str
    access_type: str
    status: str
    timestamp: datetime
    reason_if_denied: Optional[str]

class AccessLogListResponse(BaseModel):
    total: int
    items: list[AccessLogResponse]
