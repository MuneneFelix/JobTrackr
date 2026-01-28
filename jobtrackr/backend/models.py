from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    sources = relationship("JobSource", back_populates="owner")

class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    url = Column(String)
    check_frequency = Column(String) # hourly, daily, weekly
    is_active = Column(Boolean, default=True)
    last_checked = Column(DateTime, default=None)
    last_status = Column(String, default="pending") # success, failed, pending
    failure_reason = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="sources")
    jobs = relationship("JobListing", back_populates="source")

class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    company = Column(String)
    url = Column(String)
    location = Column(String, nullable=True)
    salary = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    posted_date = Column(String, nullable=True)
    is_new = Column(Boolean, default=True)
    found_at = Column(DateTime, default=datetime.datetime.utcnow)
    source_id = Column(Integer, ForeignKey("job_sources.id"))
    
    source = relationship("JobSource", back_populates="jobs")