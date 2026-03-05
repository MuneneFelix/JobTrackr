from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SecurityEvent(BaseModel):
    id: int
    event_type: str
    user_email: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    detail: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class JobSourceCreate(BaseModel):
    url: str
    name: str
    check_frequency: str = "daily"

class JobSourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    check_frequency: Optional[str] = None
    is_active: Optional[bool] = None

class JobSource(JobSourceCreate):
    id: int
    is_active: bool
    created_at: datetime
    last_checked: Optional[datetime] = None
    last_status: Optional[str] = None
    failure_reason: Optional[str] = None
    owner_id: int

    class Config:
        from_attributes = True


class JobListing(BaseModel):
    id: int
    title: str
    company: str
    url: str
    location: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    posted_date: Optional[str] = None
    is_new: bool
    is_starred: bool
    found_at: datetime
    source_id: int

    class Config:
        from_attributes = True
