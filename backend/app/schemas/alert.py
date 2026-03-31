from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AlertCreate(BaseModel):
    alert_type: str
    severity: str
    message: str = Field(..., min_length=1)
    location: Optional[str] = None
    personnel_id: Optional[str] = None

class AlertUpdate(BaseModel):
    is_resolved: bool

class AlertResponse(BaseModel):
    id: Optional[str] = None
    alert_type: str
    severity: str
    message: str
    location: Optional[str]
    personnel_id: Optional[str]
    is_resolved: bool
    created_at: datetime

class AlertListResponse(BaseModel):
    total: int
    unresolved: int
    items: list[AlertResponse]
