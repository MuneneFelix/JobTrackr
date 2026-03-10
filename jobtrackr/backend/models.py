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
    refresh_token = Column(String, nullable=True)
    refresh_token_expires = Column(DateTime, nullable=True)
    preferred_keywords = Column(Text, default="[]")
    blacklisted_companies = Column(Text, default="[]")

    sources = relationship("JobSource", back_populates="owner")
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete")
    applications = relationship("Application", back_populates="user", cascade="all, delete")


class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    name = Column(String, nullable=False)
    check_frequency = Column(String, default="daily")  # hourly | daily | weekly
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)        # True = auto-populated from DefaultJobSource
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_checked = Column(DateTime, nullable=True)
    last_status = Column(String, nullable=True)       # "success" | "failed"
    failure_reason = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="sources")
    listings = relationship("JobListing", back_populates="source", cascade="all, delete")


class DefaultJobSource(Base):
    """Admin-managed pool of sources auto-copied to every new user on registration."""
    __tablename__ = "default_job_sources"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)           # e.g. "UN Agencies", "Kenya Job Boards"
    check_frequency = Column(String, default="daily")  # hourly | daily | weekly
    is_active = Column(Boolean, default=True)          # False = excluded from new registrations
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)


class ScrapeCache(Base):
    """Shared scrape result cache keyed by URL — shared across all users to avoid duplicate API calls."""
    __tablename__ = "scrape_cache"

    id         = Column(Integer, primary_key=True)
    url        = Column(String, nullable=False, index=True)
    scraped_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    jobs_json  = Column(Text, nullable=False)   # JSON-serialised list[dict]


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
    applications = relationship("Application", back_populates="job", cascade="all, delete")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    github = Column(String, nullable=True)
    skills = Column(Text, default="[]")        # JSON array of strings
    education = Column(Text, default="[]")     # JSON array of objects
    experience = Column(Text, default="[]")    # JSON array of objects
    resume_text = Column(Text, nullable=True)
    resume_filename = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False)
    email_to = Column(String, nullable=True)
    email_subject = Column(String, nullable=True)
    email_body = Column(Text, nullable=True)
    tailored_summary = Column(Text, nullable=True)
    highlighted_skills = Column(Text, default="[]")  # JSON array
    status = Column(String, default="draft")           # draft | sent
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="applications")
    job = relationship("JobListing", back_populates="applications")
