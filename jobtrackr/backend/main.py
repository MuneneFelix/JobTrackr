from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
from passlib.context import CryptContext
from jose import JWTError, jwt
import asyncio
import datetime
import json
import logging
import os
import io
from dotenv import load_dotenv

load_dotenv()

import models
import schemas
import database
import ai_service
from scraper import scrape_source, save_new_jobs, ScraperError

# ── Structured JSON logger ───────────────────────────────────────────────────
class _JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%SZ"),
            "level": record.levelname,
            "msg": record.getMessage(),
        }
        payload.update(record.__dict__.get("extra_fields", {}))
        return json.dumps(payload)

logger = logging.getLogger("jobtrackr")
logger.setLevel(logging.INFO)
_handler = logging.StreamHandler()
_handler.setFormatter(_JsonFormatter())
logger.addHandler(_handler)
logger.propagate = False

# ── Security ────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def create_access_token(email: str) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

# ── Audit helper ─────────────────────────────────────────────────────────────
def audit(
    db: Session,
    event_type: str,
    *,
    request: Request | None = None,
    user_email: str | None = None,
    detail: str | None = None,
):
    """Write one row to security_events and emit a structured log line."""
    ip = request.client.host if request and request.client else None
    ua = request.headers.get("user-agent") if request else None

    db.add(models.SecurityEvent(
        event_type=event_type,
        user_email=user_email,
        ip_address=ip,
        user_agent=ua,
        detail=detail,
    ))
    db.commit()

    logger.info(
        event_type,
        extra={
            "event": event_type,
            "user": user_email,
            "ip": ip,
            "detail": detail,
      },
    )


# ── DB init ─────────────────────────────────────────────────────────────────
models.Base.metadata.create_all(bind=database.engine)


# ── Scheduler / scraping task ───────────────────────────────────────────────
def run_scrape_for_source(source_id: int):
    """Synchronous wrapper called by APScheduler for a single source."""
    db = database.SessionLocal()
    try:
        source = db.query(models.JobSource).filter(
            models.JobSource.id == source_id,
            models.JobSource.is_active == True,
        ).first()

        if not source:
            return

        logger.info("Scheduler: scraping source %s (%s)", source.id, source.url)

        try:
            owner = db.query(models.User).filter(models.User.id == source.owner_id).first()
            blacklisted = json.loads(owner.blacklisted_companies or "[]") if owner else []
            keywords = json.loads(owner.preferred_keywords or "[]") if owner else []

            jobs = asyncio.run(scrape_source(source.url, preferred_keywords=keywords))
            inserted = save_new_jobs(db, source.id, jobs, blacklisted_companies=blacklisted)

            source.last_checked = datetime.datetime.utcnow()
            source.last_status = "success"
            source.failure_reason = None
            db.commit()

            logger.info(
                "Source %s: %d new jobs (total scraped: %d)",
                source.id, inserted, len(jobs),
            )
        except ScraperError as exc:
            logger.error("Scrape failed for source %s: %s", source.id, exc)
            source.last_checked = datetime.datetime.utcnow()
            source.last_status = "failed"
            source.failure_reason = str(exc)
            db.commit()

    finally:
        db.close()


def schedule_all_sources():
    """(Re-)schedule all active sources according to their check_frequency."""
    db = database.SessionLocal()
    try:
        sources = db.query(models.JobSource).filter(
            models.JobSource.is_active == True
        ).all()

        for source in sources:
            job_id = f"scrape_source_{source.id}"

            # Remove old job so we can reschedule cleanly
            if scheduler.get_job(job_id):
                scheduler.remove_job(job_id)

            freq = source.check_frequency or "daily"
            trigger_kwargs = {
                "hourly":  dict(trigger="interval", hours=1),
                "daily":   dict(trigger="interval", hours=24),
                "weekly":  dict(trigger="interval", weeks=1),
            }.get(freq, dict(trigger="interval", hours=24))

            scheduler.add_job(
                run_scrape_for_source,
                id=job_id,
                args=[source.id],
                **trigger_kwargs,
            )
            logger.info(
                "Scheduled source %s with frequency '%s'", source.id, freq
            )
    finally:
        db.close()


scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    schedule_all_sources()
    scheduler.start()
    yield
    scheduler.shutdown()


# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="JobTrackr API", lifespan=lifespan)

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
_allowed_origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Dependency ───────────────────────────────────────────────────────────────
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    request: Request = None,
    db: Session = Depends(get_db),
) -> models.User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            audit(db, "TOKEN_INVALID", request=request, detail="missing sub claim")
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError as exc:
        audit(db, "TOKEN_INVALID", request=request, detail=str(exc))
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        audit(db, "TOKEN_INVALID", request=request, user_email=email, detail="user not found")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user


# ── Auth endpoints ───────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "JobTrackr API is running"}


@app.post("/token")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        audit(
            db, "LOGIN_FAILED",
            request=request,
            user_email=form_data.username,
            detail="wrong password" if user else "email not found",
        )
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    audit(db, "LOGIN_SUCCESS", request=request, user_email=user.email)
    return {"access_token": create_access_token(user.email), "token_type": "bearer"}


@app.post("/users/", response_model=schemas.UserBase)
def create_user(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        audit(db, "REGISTER_FAILED", request=request, user_email=user.email, detail="email already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    audit(db, "REGISTER", request=request, user_email=user.email)
    return db_user


# ── Password reset ───────────────────────────────────────────────────────────
import secrets

@app.post("/auth/forgot-password")
def forgot_password(
    body: schemas.ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user:
        return {"detail": "If that email is registered you will receive a reset link."}

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    db.commit()

    # TODO: send email in production. Token is returned directly for now (dev only).
    logger.info("Password reset requested for %s", user.email)
    return {
        "detail": "If that email is registered you will receive a reset link.",
        "dev_token": token,
    }


@app.post("/auth/reset-password")
def reset_password(
    body: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(
        models.User.reset_token == body.token
    ).first()
    if not user or user.reset_token_expires < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.hashed_password = pwd_context.hash(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"detail": "Password updated successfully"}


@app.patch("/users/me/password")
def change_password(
    body: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not pwd_context.verify(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = pwd_context.hash(body.new_password)
    db.commit()
    return {"detail": "Password changed successfully"}


# ── Job Sources ──────────────────────────────────────────────────────────────
@app.post("/sources/", response_model=schemas.JobSource)
def create_job_source(
    source: schemas.JobSourceCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_source = models.JobSource(**source.dict(), owner_id=current_user.id)
    db.add(db_source)
    db.commit()
    db.refresh(db_source)

    # Re-schedule so the new source is picked up immediately
    schedule_all_sources()

    # Kick off a first scrape right away in the background
    background_tasks.add_task(run_scrape_for_source, db_source.id)

    return db_source


@app.get("/sources/", response_model=list[schemas.JobSource])
def list_job_sources(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id)
        .all()
    )


@app.delete("/sources/{source_id}")
def delete_job_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source = db.query(models.JobSource).filter(
        models.JobSource.id == source_id,
        models.JobSource.owner_id == current_user.id,
    ).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(source)
    db.commit()
    schedule_all_sources()
    return {"detail": "Deleted"}


@app.patch("/sources/{source_id}", response_model=schemas.JobSource)
def update_job_source(
    source_id: int,
    updates: schemas.JobSourceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source = db.query(models.JobSource).filter(
        models.JobSource.id == source_id,
        models.JobSource.owner_id == current_user.id,
    ).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(source, field, value)

    db.commit()
    db.refresh(source)
    schedule_all_sources()
    return source


# ── Manual scrape trigger ────────────────────────────────────────────────────
@app.post("/sources/{source_id}/scrape")
def trigger_scrape(
    source_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Manually trigger an immediate scrape for a source."""
    source = db.query(models.JobSource).filter(
        models.JobSource.id == source_id,
        models.JobSource.owner_id == current_user.id,
    ).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    background_tasks.add_task(run_scrape_for_source, source_id)
    return {"detail": f"Scrape triggered for source {source_id}"}


# ── Jobs ─────────────────────────────────────────────────────────────────────
@app.get("/jobs/", response_model=list[schemas.JobListing])
def list_jobs(
    source_id: int | None = None,
    new_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return jobs belonging to the current user's sources."""
    # Get all source IDs owned by this user
    source_ids = [
        s.id
        for s in db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id)
        .all()
    ]

    query = db.query(models.JobListing).filter(
        models.JobListing.source_id.in_(source_ids)
    )

    if source_id:
        query = query.filter(models.JobListing.source_id == source_id)
    if new_only:
        query = query.filter(models.JobListing.is_new == True)

    return query.order_by(models.JobListing.found_at.desc()).all()


@app.get("/jobs/{job_id}", response_model=schemas.JobListing)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_ids = [
        s.id
        for s in db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id)
        .all()
    ]
    job = db.query(models.JobListing).filter(
        models.JobListing.id == job_id,
        models.JobListing.source_id.in_(source_ids),
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.patch("/jobs/{job_id}/star")
def toggle_star(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_ids = [
        s.id for s in db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id).all()
    ]
    job = db.query(models.JobListing).filter(
        models.JobListing.id == job_id,
        models.JobListing.source_id.in_(source_ids),
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.is_starred = not job.is_starred

    # When starring: extract keywords from title and add to user preferences
    if job.is_starred and job.title:
        _STOP = {"with", "that", "this", "from", "have", "they", "will", "been",
                 "were", "your", "their", "and", "for", "the", "are", "has"}
        new_words = [
            w.lower() for w in job.title.split()
            if len(w) > 3 and w.lower() not in _STOP
        ]
        existing = json.loads(current_user.preferred_keywords or "[]")
        current_user.preferred_keywords = json.dumps(list(set(existing + new_words)))

    db.commit()
    return {"is_starred": job.is_starred}


@app.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_ids = [
        s.id for s in db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id).all()
    ]
    job = db.query(models.JobListing).filter(
        models.JobListing.id == job_id,
        models.JobListing.source_id.in_(source_ids),
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"detail": "Deleted"}


@app.post("/jobs/{job_id}/blacklist")
def blacklist_company(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_ids = [
        s.id for s in db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id).all()
    ]
    job = db.query(models.JobListing).filter(
        models.JobListing.id == job_id,
        models.JobListing.source_id.in_(source_ids),
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    company = job.company or ""
    if company:
        blacklisted = json.loads(current_user.blacklisted_companies or "[]")
        if company not in blacklisted:
            blacklisted.append(company)
            current_user.blacklisted_companies = json.dumps(blacklisted)
        # Also delete all existing jobs from this company
        db.query(models.JobListing).filter(
            models.JobListing.source_id.in_(source_ids),
            models.JobListing.company == company,
        ).delete(synchronize_session=False)
        db.commit()

    return {"detail": f"Blacklisted '{company}' and removed their jobs"}


@app.patch("/jobs/{job_id}/read")
def mark_job_read(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_ids = [
        s.id
        for s in db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id)
        .all()
    ]
    job = db.query(models.JobListing).filter(
        models.JobListing.id == job_id,
        models.JobListing.source_id.in_(source_ids),
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.is_new = False
    db.commit()
    return {"detail": "Marked as read"}


# ── Admin: all sources / jobs ─────────────────────────────────────────────────
@app.get("/admin/sources/", response_model=list[schemas.JobSource])
def admin_list_sources(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail="GET /admin/sources/")
        raise HTTPException(status_code=403, detail="Admins only")
    return db.query(models.JobSource).all()


@app.get("/admin/jobs/", response_model=list[schemas.JobListing])
def admin_list_jobs(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail="GET /admin/jobs/")
        raise HTTPException(status_code=403, detail="Admins only")
    return db.query(models.JobListing).order_by(
        models.JobListing.found_at.desc()
    ).all()


@app.get("/admin/events/", response_model=list[schemas.SecurityEvent])
def admin_list_events(
    request: Request,
    event_type: str | None = None,
    user_email: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail="GET /admin/events/")
        raise HTTPException(status_code=403, detail="Admins only")
    query = db.query(models.SecurityEvent)
    if event_type:
        query = query.filter(models.SecurityEvent.event_type == event_type)
    if user_email:
        query = query.filter(models.SecurityEvent.user_email == user_email)
    return query.order_by(models.SecurityEvent.created_at.desc()).limit(limit).all()


# ── User Profile ──────────────────────────────────────────────────────────────

def _get_or_create_profile(db: Session, user_id: int) -> models.UserProfile:
    profile = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == user_id
    ).first()
    if not profile:
        profile = models.UserProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile



@app.get("/users/me/profile", response_model=schemas.UserProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = _get_or_create_profile(db, current_user.id)
    out = schemas.UserProfileOut(
        full_name=profile.full_name,
        phone=profile.phone,
        location=profile.location,
        linkedin=profile.linkedin,
        github=profile.github,
        skills=json.loads(profile.skills or "[]"),
        education=json.loads(profile.education or "[]"),
        experience=json.loads(profile.experience or "[]"),
        resume_filename=profile.resume_filename,
        updated_at=profile.updated_at,
    )
    return out


@app.patch("/users/me/profile", response_model=schemas.UserProfileOut)
def update_profile(
    body: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = _get_or_create_profile(db, current_user.id)
    if body.full_name is not None:
        profile.full_name = body.full_name
    if body.phone is not None:
        profile.phone = body.phone
    if body.location is not None:
        profile.location = body.location
    if body.linkedin is not None:
        profile.linkedin = body.linkedin
    if body.github is not None:
        profile.github = body.github
    if body.skills is not None:
        profile.skills = json.dumps(body.skills)
    if body.education is not None:
        profile.education = json.dumps(body.education)
    if body.experience is not None:
        profile.experience = json.dumps(body.experience)
    profile.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return get_profile(db=db, current_user=current_user)


@app.post("/users/me/resume", response_model=schemas.UserProfileOut)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Upload a PDF or DOCX resume; AI extracts profile data automatically."""
    content = await file.read()
    filename = file.filename or ""
    resume_text = ""

    if filename.lower().endswith(".pdf"):
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                resume_text = "\n".join(
                    page.extract_text() or "" for page in pdf.pages
                )
        except Exception as exc:
            logger.error("PDF extraction failed: %s", exc)
            raise HTTPException(status_code=422, detail="Could not read PDF file")
    elif filename.lower().endswith((".docx", ".doc")):
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            resume_text = "\n".join(p.text for p in doc.paragraphs)
        except Exception as exc:
            logger.error("DOCX extraction failed: %s", exc)
            raise HTTPException(status_code=422, detail="Could not read DOCX file")
    else:
        # Try plain text fallback
        try:
            resume_text = content.decode("utf-8", errors="ignore")
        except Exception:
            raise HTTPException(status_code=422, detail="Unsupported file type")

    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="No text could be extracted from the file")

    parsed = ai_service.parse_resume(resume_text)

    profile = _get_or_create_profile(db, current_user.id)
    profile.resume_text = resume_text
    profile.resume_filename = filename
    if parsed.get("full_name"):
        profile.full_name = parsed["full_name"]
    if parsed.get("phone"):
        profile.phone = parsed["phone"]
    if parsed.get("location"):
        profile.location = parsed["location"]
    if parsed.get("linkedin"):
        profile.linkedin = parsed["linkedin"]
    if parsed.get("github"):
        profile.github = parsed["github"]
    if parsed.get("skills"):
        profile.skills = json.dumps(parsed["skills"])
    if parsed.get("education"):
        profile.education = json.dumps(parsed["education"])
    if parsed.get("experience"):
        profile.experience = json.dumps(parsed["experience"])
    profile.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return get_profile(db=db, current_user=current_user)


# ── Applications ──────────────────────────────────────────────────────────────

@app.post("/applications/generate")
def generate_applications(
    body: schemas.ApplicationGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate AI email drafts + tailored resume summaries for a list of job IDs."""
    source_ids = [
        s.id for s in db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id).all()
    ]

    profile = _get_or_create_profile(db, current_user.id)
    profile_dict = {
        "full_name": profile.full_name or current_user.email.split("@")[0],
        "phone": profile.phone,
        "location": profile.location,
        "linkedin": profile.linkedin,
        "github": profile.github,
        "skills": json.loads(profile.skills or "[]"),
        "education": json.loads(profile.education or "[]"),
        "experience": json.loads(profile.experience or "[]"),
    }

    drafts = []
    for job_id in body.job_ids:
        job = db.query(models.JobListing).filter(
            models.JobListing.id == job_id,
            models.JobListing.source_id.in_(source_ids),
        ).first()
        if not job:
            continue

        job_dict = {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "description": job.description,
            "location": job.location,
        }

        email = ai_service.generate_application_email(job_dict, profile_dict)
        tailored = ai_service.tailor_resume(job_dict, profile_dict)

        drafts.append({
            "job_id": job.id,
            "job_title": job.title,
            "job_company": job.company,
            "job_url": job.url,
            "email_subject": email.get("subject", ""),
            "email_body": email.get("body", ""),
            "tailored_summary": tailored.get("summary", ""),
            "highlighted_skills": tailored.get("highlighted_skills", []),
        })

    return {"drafts": drafts, "profile": profile_dict}


@app.post("/applications/", response_model=list[schemas.ApplicationOut])
def save_applications(
    body: schemas.ApplicationSaveRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Save sent/drafted applications to DB."""
    source_ids = [
        s.id for s in db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id).all()
    ]
    saved = []
    for d in body.drafts:
        job_id = d.get("job_id")
        job = db.query(models.JobListing).filter(
            models.JobListing.id == job_id,
            models.JobListing.source_id.in_(source_ids),
        ).first()
        if not job:
            continue
        app_obj = models.Application(
            user_id=current_user.id,
            job_id=job_id,
            email_to=d.get("email_to", ""),
            email_subject=d.get("email_subject", ""),
            email_body=d.get("email_body", ""),
            tailored_summary=d.get("tailored_summary", ""),
            highlighted_skills=json.dumps(d.get("highlighted_skills", [])),
            status=d.get("status", "sent"),
        )
        db.add(app_obj)
        db.flush()
        saved.append(app_obj)
    db.commit()
    for a in saved:
        db.refresh(a)
    return [
        schemas.ApplicationOut(
            id=a.id,
            job_id=a.job_id,
            email_subject=a.email_subject,
            email_body=a.email_body,
            tailored_summary=a.tailored_summary,
            highlighted_skills=json.loads(a.highlighted_skills or "[]"),
            status=a.status,
            created_at=a.created_at,
        )
        for a in saved
    ]


@app.get("/applications/", response_model=list[schemas.ApplicationOut])
def list_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    apps = (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.id)
        .order_by(models.Application.created_at.desc())
        .all()
    )
    return [
        schemas.ApplicationOut(
            id=a.id,
            job_id=a.job_id,
            email_subject=a.email_subject,
            email_body=a.email_body,
            tailored_summary=a.tailored_summary,
            highlighted_skills=json.loads(a.highlighted_skills or "[]"),
            status=a.status,
            created_at=a.created_at,
        )
        for a in apps
    ]
