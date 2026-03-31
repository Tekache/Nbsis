from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserSignup(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=72)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)

class UserResponse(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: str
    role: str
    is_active: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserProfileResponse(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    role: str
    department: Optional[str] = None
    joinDate: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    old_password: str = Field(..., min_length=6, max_length=72)
    new_password: str = Field(..., min_length=6, max_length=72)
