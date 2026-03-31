from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Alert(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    alert_type: str  # access_denial, breach_attempt, unauthorized_area, system_alert
    severity: str  # low, medium, high, critical
    message: str
    location: Optional[str] = None
    personnel_id: Optional[str] = None
    is_resolved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
