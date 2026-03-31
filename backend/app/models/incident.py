from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Incident(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    description: str
    incident_type: str  # breach, unauthorized_access, theft, other
    severity: str  # low, medium, high, critical
    location: str
    reported_by: str
    assigned_to: Optional[str] = None
    status: str = "open"  # open, in_progress, resolved, closed
    evidence: list[str] = []
    notes: list[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
