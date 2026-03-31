from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class PersonnelCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    position: str
    access_level: str
    phone: str
    assigned_areas: list[str] = []

class PersonnelUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    position: Optional[str] = None
    access_level: Optional[str] = None
    phone: Optional[str] = None
    assigned_areas: Optional[list[str]] = None
    clearance_status: Optional[str] = None
    is_active: Optional[bool] = None

class PersonnelResponse(BaseModel):
    id: Optional[str] = None
    employee_id: str
    full_name: str
    email: str
    department: str
    position: str
    access_level: str
    phone: str
    assigned_areas: list[str]
    clearance_status: str
    is_active: bool
    created_at: datetime

class PersonnelListResponse(BaseModel):
    total: int
    items: list[PersonnelResponse]
