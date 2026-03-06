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


# ── User Profile ──────────────────────────────────────────────────────────────

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    skills: Optional[list] = None
    education: Optional[list] = None
    experience: Optional[list] = None

class UserProfileOut(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    skills: list = []
    education: list = []
    experience: list = []
    resume_filename: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Applications ──────────────────────────────────────────────────────────────

class ApplicationGenerateRequest(BaseModel):
    job_ids: list[int]

class ApplicationDraft(BaseModel):
    job_id: int
    job_title: str
    job_company: str
    email_subject: str
    email_body: str
    tailored_summary: str
    highlighted_skills: list[str]

class ApplicationSaveRequest(BaseModel):
    drafts: list[dict]

class ApplicationOut(BaseModel):
    id: int
    job_id: int
    email_subject: Optional[str] = None
    email_body: Optional[str] = None
    tailored_summary: Optional[str] = None
    highlighted_skills: list = []
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
