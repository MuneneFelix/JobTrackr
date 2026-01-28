from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JobListingBase(BaseModel):
    title: str
    company: str
    url: str
    location: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    posted_date: Optional[str] = None
    is_new: bool = True

class JobListing(JobListingBase):
    id: int
    found_at: datetime
    class Config:
        from_attributes = True

class JobSourceBase(BaseModel):
    title: str
    url: str
    check_frequency: str
    is_active: bool = True

class JobSourceCreate(JobSourceBase):
    pass

class JobSource(JobSourceBase):
    id: int
    owner_id: int
    last_checked: Optional[datetime] = None
    last_status: str = "pending"
    failure_reason: Optional[str] = None
    jobs: List[JobListing] = []
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    sources: List[JobSource] = []
    class Config:
        from_attributes = True