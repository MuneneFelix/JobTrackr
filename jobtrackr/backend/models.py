from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)
    preferred_keywords = Column(Text, default="[]")
    blacklisted_companies = Column(Text, default="[]")

    sources = relationship("JobSource", back_populates="owner")


class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    name = Column(String, nullable=False)
    check_frequency = Column(String, default="daily")  # hourly | daily | weekly
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_checked = Column(DateTime, nullable=True)
    last_status = Column(String, nullable=True)       # "success" | "failed"
    failure_reason = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="sources")
    listings = relationship("JobListing", back_populates="source", cascade="all, delete")


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False, index=True)   # LOGIN_SUCCESS | LOGIN_FAILED | TOKEN_INVALID | REGISTER | UNAUTHORIZED
    user_email = Column(String, nullable=True, index=True)    # None for anonymous attempts
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    detail = Column(String, nullable=True)                    # Internal detail — never sent to client
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, default="")
    url = Column(String, default="")
    location = Column(String, nullable=True)
    salary = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    posted_date = Column(String, nullable=True)
    is_new = Column(Boolean, default=True)
    is_starred = Column(Boolean, default=False)
    found_at = Column(DateTime, default=datetime.datetime.utcnow)
    source_id = Column(Integer, ForeignKey("job_sources.id"))

    source = relationship("JobSource", back_populates="listings")
