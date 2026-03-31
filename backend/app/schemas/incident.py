from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    incident_type: str
    severity: str
    location: str
    reported_by: str

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    severity: Optional[str] = None

class IncidentAddNote(BaseModel):
    note: str = Field(..., min_length=1)
    author: str

class IncidentResponse(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    incident_type: str
    severity: str
    location: str
    reported_by: str
    assigned_to: Optional[str]
    status: str
    notes: list[dict]
    created_at: datetime
    updated_at: datetime

class IncidentListResponse(BaseModel):
    total: int
    items: list[IncidentResponse]
