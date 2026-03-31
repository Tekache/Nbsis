from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Personnel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    employee_id: str
    full_name: str
    email: str
    department: str
    position: str
    access_level: str  # level1, level2, level3
    phone: str
    assigned_areas: list[str] = []
    clearance_status: str = "pending"  # pending, approved, rejected
    clearance_date: Optional[datetime] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
