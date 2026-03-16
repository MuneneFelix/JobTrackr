from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
from passlib.context import CryptContext
from jose import JWTError, jwt
import asyncio
import base64
import datetime
import hashlib
import json
import logging
import os
import io
import smtplib
import ssl
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from cryptography.fernet import Fernet
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
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is required — set it before starting the server")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def _sha256(value: str) -> str:
    """Return a hex SHA-256 digest of value — used to store lookup tokens without exposing plaintext."""
    return hashlib.sha256(value.encode()).hexdigest()


# ── Fernet encryption helpers (for SMTP password at rest) ────────────────────

def _fernet() -> Fernet:
    """Derive a stable Fernet key from SECRET_KEY."""
    raw = hashlib.sha256(SECRET_KEY.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(raw))

def _encrypt(plain: str) -> str:
    return _fernet().encrypt(plain.encode()).decode()

def _decrypt(token: str) -> str:
    return _fernet().decrypt(token.encode()).decode()


# ── Email send helper ─────────────────────────────────────────────────────────

def _send_email(
    to: str,
    subject: str,
    body: str,
    db,
    *,
    email_type: str = "application",
    user_id: int | None = None,
) -> None:
    """Send an email via the configured SMTP server and log the result."""
    cfg = db.query(models.SMTPConfig).filter(models.SMTPConfig.id == 1).first()
    if not cfg:
        raise HTTPException(status_code=503, detail="SMTP not configured")

    password = _decrypt(cfg.password)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{cfg.from_name} <{cfg.from_email}>"
    msg["To"]      = to
    msg.attach(MIMEText(body, "plain", "utf-8"))

    error_str: str | None = None
    try:
        if cfg.use_tls:
            with smtplib.SMTP(cfg.host, cfg.port, timeout=15) as server:
                server.ehlo()
                server.starttls(context=ssl.create_default_context())
                server.login(cfg.username, password)
                server.sendmail(cfg.from_email, to, msg.as_string())
        else:
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(cfg.host, cfg.port, context=ctx, timeout=15) as server:
                server.login(cfg.username, password)
                server.sendmail(cfg.from_email, to, msg.as_string())
        status = "sent"
    except Exception as exc:
        error_str = str(exc)
        status = "failed"
        logger.error("Email send failed to %s: %s", to, exc)

    # Always log the attempt
    db.add(models.EmailLog(
        to_email=to,
        subject=subject,
        body_preview=body[:400],
        email_type=email_type,
        status=status,
        error=error_str,
        user_id=user_id,
    ))
    db.commit()

    if status == "failed":
        raise HTTPException(status_code=502, detail=f"Email delivery failed: {error_str}")


# ── Digest body builder ───────────────────────────────────────────────────────

def _build_digest_body(jobs: list, user) -> str:
    name = ""
    if hasattr(user, "profile") and user.profile and user.profile.full_name:
        name = user.profile.full_name.split()[0]
    greeting = f"Hi {name}," if name else "Hi,"

    lines = [
        f"{greeting}",
        f"",
        f"Here are your {len(jobs)} new job listing{'s' if len(jobs) > 1 else ''} from JobTrackr:",
        f"",
    ]
    for j in jobs:
        lines.append(f"  • {j.title} — {j.company or 'Unknown company'}")
        if j.location:
            lines.append(f"    Location: {j.location}")
        if j.url:
            lines.append(f"    Link: {j.url}")
        lines.append("")

    lines += [
        "Log in to review and apply: https://jobtrackr.space/jobs",
        "",
        "— The JobTrackr Team",
        "",
        "To change your digest settings, visit: https://jobtrackr.space/settings",
    ]
    return "\n".join(lines)


def create_access_token(email: str) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token() -> str:
    """Return a new opaque refresh token (plaintext — caller must hash before storing)."""
    return secrets.token_urlsafe(48)

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
    # Prefer X-Forwarded-For / X-Real-IP set by the reverse proxy (Caddy/Nginx)
    # in front of Docker; fall back to the raw socket peer (Docker bridge IP).
    if request:
        xff = request.headers.get("X-Forwarded-For")
        ip  = xff.split(",")[0].strip() if xff else (
              request.headers.get("X-Real-IP") or
              (request.client.host if request.client else None))
    else:
        ip = None
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


# ── Scrape cache helpers ─────────────────────────────────────────────────────

FREQ_HOURS: dict[str, int] = {"hourly": 1, "daily": 24, "weekly": 168}


def _get_cached_jobs(db, url: str, freq: str) -> list[dict] | None:
    """Return cached jobs if a fresh scrape for this URL exists within the frequency window."""
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(
        hours=FREQ_HOURS.get(freq or "daily", 24)
    )
    row = (
        db.query(models.ScrapeCache)
        .filter(
            models.ScrapeCache.url == url,
            models.ScrapeCache.scraped_at >= cutoff,
        )
        .order_by(models.ScrapeCache.scraped_at.desc())
        .first()
    )
    return json.loads(row.jobs_json) if row else None


def _store_cache(db, url: str, jobs: list[dict]) -> None:
    """Save fresh scrape results and prune old entries (keep ≤3 per URL)."""
    db.add(models.ScrapeCache(url=url, jobs_json=json.dumps(jobs)))
    db.flush()  # assign id so the ORDER BY below is stable
    # Prune to keep only the 3 most recent entries for this URL
    old_rows = (
        db.query(models.ScrapeCache)
        .filter(models.ScrapeCache.url == url)
        .order_by(models.ScrapeCache.scraped_at.desc())
        .offset(3)
        .all()
    )
    for row in old_rows:
        db.delete(row)
    db.commit()


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

            # ── Cross-user scrape cache ──────────────────────────────────────
            cached = _get_cached_jobs(db, source.url, source.check_frequency)
            if cached is not None:
                jobs = cached
                logger.info("Cache HIT for source %s (%s) — %d jobs", source.id, source.url, len(jobs))
            else:
                # keywords only reorder AI output, not filter — safe to omit for shared cache
                jobs = asyncio.run(scrape_source(source.url))
                _store_cache(db, source.url, jobs)
                logger.info("Cache MISS for source %s (%s) — scraped %d jobs", source.id, source.url, len(jobs))

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


def send_digest_job():
    """Hourly APScheduler job: send email digests to users whose window has elapsed."""
    db = database.SessionLocal()
    try:
        now = datetime.datetime.utcnow()
        configs = (
            db.query(models.DigestConfig)
            .filter(
                models.DigestConfig.enabled == True,
                models.DigestConfig.frequency != "never",
            )
            .all()
        )
        for cfg in configs:
            # Check frequency window
            if cfg.frequency == "daily":
                if cfg.last_sent and (now - cfg.last_sent).total_seconds() < 82800:
                    continue
            elif cfg.frequency == "weekly":
                if cfg.last_sent and (now - cfg.last_sent).total_seconds() < 604800:
                    continue

            # Only fire at the configured hour
            if now.hour != cfg.send_hour:
                continue

            user = db.query(models.User).filter(models.User.id == cfg.user_id).first()
            if not user or not user.is_active:
                continue

            since = cfg.last_sent or (now - datetime.timedelta(days=7))
            source_ids = [s.id for s in user.sources if s.is_active]
            if not source_ids:
                cfg.last_sent = now
                db.commit()
                continue

            new_jobs = (
                db.query(models.JobListing)
                .filter(
                    models.JobListing.source_id.in_(source_ids),
                    models.JobListing.found_at >= since,
                )
                .order_by(models.JobListing.found_at.desc())
                .limit(50)
                .all()
            )

            cfg.last_sent = now
            db.commit()

            if not new_jobs:
                continue

            subject = f"JobTrackr: {len(new_jobs)} new job{'s' if len(new_jobs) > 1 else ''} found"
            body = _build_digest_body(new_jobs, user)
            try:
                _send_email(
                    user.email, subject, body, db,
                    email_type="digest", user_id=cfg.user_id,
                )
            except Exception as exc:
                logger.error("Digest send failed for user %s: %s", user.id, exc)
    finally:
        db.close()


scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    schedule_all_sources()
    scheduler.add_job(
        send_digest_job,
        trigger="interval",
        hours=1,
        id="send_digest_job",
        replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown()


# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="JobTrackr API", lifespan=lifespan)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
_allowed_origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

_IS_PROD = os.getenv("ENV", "development").lower() == "production"

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if _IS_PROD:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "connect-src 'self'"
    )
    return response


# ── Dependency ───────────────────────────────────────────────────────────────
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    _bearer: str | None = Depends(OAuth2PasswordBearer(tokenUrl="token", auto_error=False)),
) -> models.User:
    token = request.cookies.get("access_token") or _bearer
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
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
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
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
    refresh_tok = create_refresh_token()
    access_tok = create_access_token(user.email)
    user.refresh_token = _sha256(refresh_tok)
    user.refresh_token_expires = datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()
    audit(db, "LOGIN_SUCCESS", request=request, user_email=user.email)

    _cookie_kwargs = dict(httponly=True, samesite="lax", secure=_IS_PROD)
    response.set_cookie("access_token", access_tok, max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, **_cookie_kwargs)
    response.set_cookie("refresh_token", refresh_tok, max_age=REFRESH_TOKEN_EXPIRE_DAYS * 86400, **_cookie_kwargs)

    return {
        "access_token": access_tok,
        "refresh_token": refresh_tok,
        "token_type": "bearer",
    }


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
    # Auto-populate active default sources for every new user
    defaults = db.query(models.DefaultJobSource).filter(
        models.DefaultJobSource.is_active == True
    ).all()
    for d in defaults:
        db.add(models.JobSource(
            url=d.url,
            name=d.name,
            check_frequency=d.check_frequency,
            is_default=True,
            owner_id=db_user.id,
        ))
    if defaults:
        db.commit()
    audit(db, "REGISTER", request=request, user_email=user.email)
    return db_user


# ── Password reset ───────────────────────────────────────────────────────────

@app.post("/auth/forgot-password")
@limiter.limit("3/minute")
def forgot_password(
    body: schemas.ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user:
        return {"detail": "If that email is registered you will receive a reset link."}

    token = secrets.token_urlsafe(32)
    user.reset_token = _sha256(token)
    user.reset_token_expires = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    db.commit()

    # TODO: send email in production with reset link containing `token`.
    # Logged here for dev only — NEVER expose in API response.
    logger.info("Password reset token for %s (dev only): %s", user.email, token)
    return {"detail": "If that email is registered you will receive a reset link."}


@app.post("/auth/reset-password")
@limiter.limit("5/minute")
def reset_password(
    body: schemas.ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(
        models.User.reset_token == _sha256(body.token)
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


@app.get("/auth/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Return the currently authenticated user — used for session checks."""
    return current_user


@app.post("/auth/refresh")
@limiter.limit("10/minute")
def refresh_access_token(
    request: Request,
    body: schemas.RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Exchange a valid refresh token for a new access token."""
    token_hash = _sha256(body.refresh_token)
    user = db.query(models.User).filter(
        models.User.refresh_token == token_hash
    ).first()
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    if not user or not user.refresh_token_expires or user.refresh_token_expires < now:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Rotate: issue a new refresh token on every use
    new_refresh = create_refresh_token()
    user.refresh_token = _sha256(new_refresh)
    user.refresh_token_expires = now + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()

    return {
        "access_token": create_access_token(user.email),
        "refresh_token": new_refresh,
        "token_type": "bearer",
    }


@app.post("/auth/logout")
def logout(
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Revoke the refresh token and clear auth cookies."""
    current_user.refresh_token = None
    current_user.refresh_token_expires = None
    db.commit()
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"detail": "Logged out"}


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
    force: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Manually trigger an immediate scrape for a source.

    Skips if the source was already checked within its frequency window
    (unless force=true is passed as a query parameter).
    """
    source = db.query(models.JobSource).filter(
        models.JobSource.id == source_id,
        models.JobSource.owner_id == current_user.id,
    ).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    # Per-user dedup: skip if already scraped within the frequency window
    if not force and source.last_checked:
        freq_hours = FREQ_HOURS.get(source.check_frequency or "daily", 24)
        elapsed_h = (datetime.datetime.utcnow() - source.last_checked).total_seconds() / 3600
        if elapsed_h < freq_hours:
            remaining_h = freq_hours - elapsed_h
            remaining_str = (
                f"{int(remaining_h * 60)}m" if remaining_h < 1 else f"{remaining_h:.1f}h"
            )
            return {
                "skipped": True,
                "reason": f"Already scraped ({source.check_frequency or 'daily'}). Next due in {remaining_str}.",
            }

    background_tasks.add_task(run_scrape_for_source, source_id)
    return {"detail": f"Scrape triggered for source {source_id}", "skipped": False}


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


# ── Admin: User Management ────────────────────────────────────────────────────

@app.get("/admin/users/", response_model=list[schemas.UserOut])
def admin_list_users(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail="GET /admin/users/")
        raise HTTPException(status_code=403, detail="Admins only")
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@app.patch("/admin/users/{user_id}", response_model=schemas.UserOut)
def admin_update_user(
    user_id: int,
    body: schemas.UserAdminUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail=f"PATCH /admin/users/{user_id}")
        raise HTTPException(status_code=403, detail="Admins only")
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    # Prevent admin from demoting themselves
    if target.id == current_user.id and body.is_admin is False:
        raise HTTPException(status_code=400, detail="Cannot remove your own admin rights")
    if body.is_admin is not None:
        target.is_admin = body.is_admin
    if body.is_active is not None:
        target.is_active = body.is_active
    db.commit()
    db.refresh(target)
    return target


# ── Admin: Default Job Sources ────────────────────────────────────────────────

@app.get("/admin/default-sources/", response_model=list[schemas.DefaultJobSourceOut])
def admin_list_default_sources(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail="GET /admin/default-sources/")
        raise HTTPException(status_code=403, detail="Admins only")
    return db.query(models.DefaultJobSource).order_by(
        models.DefaultJobSource.category, models.DefaultJobSource.name
    ).all()


@app.post("/admin/default-sources/", response_model=schemas.DefaultJobSourceOut)
def admin_create_default_source(
    source: schemas.DefaultJobSourceCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail="POST /admin/default-sources/")
        raise HTTPException(status_code=403, detail="Admins only")
    db_source = models.DefaultJobSource(**source.dict(), created_by_id=current_user.id)
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source


@app.post("/admin/default-sources/bulk", response_model=list[schemas.DefaultJobSourceOut])
def admin_bulk_create_default_sources(
    body: schemas.DefaultJobSourceBulk,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail="POST /admin/default-sources/bulk")
        raise HTTPException(status_code=403, detail="Admins only")
    created = []
    for s in body.sources:
        db_source = models.DefaultJobSource(**s.dict(), created_by_id=current_user.id)
        db.add(db_source)
        db.flush()
        created.append(db_source)
    db.commit()
    for s in created:
        db.refresh(s)
    return created


@app.patch("/admin/default-sources/{source_id}", response_model=schemas.DefaultJobSourceOut)
def admin_update_default_source(
    source_id: int,
    body: schemas.DefaultJobSourceUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail=f"PATCH /admin/default-sources/{source_id}")
        raise HTTPException(status_code=403, detail="Admins only")
    source = db.query(models.DefaultJobSource).filter(models.DefaultJobSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Default source not found")
    for field, value in body.dict(exclude_unset=True).items():
        setattr(source, field, value)
    db.commit()
    db.refresh(source)
    return source


@app.delete("/admin/default-sources/{source_id}")
def admin_delete_default_source(
    source_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail=f"DELETE /admin/default-sources/{source_id}")
        raise HTTPException(status_code=403, detail="Admins only")
    source = db.query(models.DefaultJobSource).filter(models.DefaultJobSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Default source not found")
    db.delete(source)
    db.commit()
    return {"detail": "Deleted"}


@app.post("/admin/default-sources/push-to-all")
def admin_push_defaults_to_all(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Push all active default sources to every existing user who doesn't have them yet."""
    if not current_user.is_admin:
        audit(db, "UNAUTHORIZED", request=request, user_email=current_user.email, detail="POST /admin/default-sources/push-to-all")
        raise HTTPException(status_code=403, detail="Admins only")
    defaults = db.query(models.DefaultJobSource).filter(models.DefaultJobSource.is_active == True).all()
    if not defaults:
        return {"added": 0, "users_updated": 0}
    users = db.query(models.User).filter(models.User.is_active == True).all()
    total_added = 0
    users_updated = 0
    for user in users:
        existing_urls = {
            s.url for s in db.query(models.JobSource)
            .filter(models.JobSource.owner_id == user.id).all()
        }
        added_for_user = 0
        for d in defaults:
            if d.url not in existing_urls:
                db.add(models.JobSource(
                    url=d.url, name=d.name,
                    check_frequency=d.check_frequency,
                    is_default=True,
                    owner_id=user.id,
                ))
                added_for_user += 1
        if added_for_user:
            total_added += added_for_user
            users_updated += 1
    db.commit()
    return {"added": total_added, "users_updated": users_updated}


# ── User: Sync default sources ────────────────────────────────────────────────

@app.post("/sources/sync-defaults")
def sync_default_sources(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Pull any active default sources the current user doesn't have yet."""
    defaults = db.query(models.DefaultJobSource).filter(models.DefaultJobSource.is_active == True).all()
    existing_urls = {
        s.url for s in db.query(models.JobSource)
        .filter(models.JobSource.owner_id == current_user.id).all()
    }
    added = 0
    for d in defaults:
        if d.url not in existing_urls:
            db.add(models.JobSource(
                url=d.url, name=d.name,
                check_frequency=d.check_frequency,
                is_default=True,
                owner_id=current_user.id,
            ))
            added += 1
    if added:
        db.commit()
    return {"added": added}


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
    _MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
    content = await file.read()
    if len(content) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large — maximum size is 10 MB")
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


@app.post("/applications/{application_id}/send")
def send_application_email(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Send a saved application email via SMTP and mark it as sent."""
    app_obj = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id,
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    if not app_obj.email_to:
        raise HTTPException(status_code=400, detail="No recipient address on this application")

    _send_email(
        app_obj.email_to,
        app_obj.email_subject or "(no subject)",
        app_obj.email_body or "",
        db,
        email_type="application",
        user_id=current_user.id,
    )
    app_obj.status = "sent"
    db.commit()
    return {"sent": True, "to": app_obj.email_to}


# ── SMTP config (admin) ───────────────────────────────────────────────────────

@app.get("/admin/smtp/", response_model=schemas.SMTPConfigOut)
def get_smtp_config(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    cfg = db.query(models.SMTPConfig).filter(models.SMTPConfig.id == 1).first()
    if not cfg:
        raise HTTPException(status_code=404, detail="SMTP not configured")
    return schemas.SMTPConfigOut(
        host=cfg.host,
        port=cfg.port,
        username=cfg.username,
        password="****",
        from_email=cfg.from_email,
        from_name=cfg.from_name,
        use_tls=cfg.use_tls,
        updated_at=cfg.updated_at,
    )


@app.put("/admin/smtp/", response_model=schemas.SMTPConfigOut)
def save_smtp_config(
    body: schemas.SMTPConfigIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    cfg = db.query(models.SMTPConfig).filter(models.SMTPConfig.id == 1).first()
    encrypted_pw = _encrypt(body.password)
    if cfg:
        cfg.host       = body.host
        cfg.port       = body.port
        cfg.username   = body.username
        cfg.password   = encrypted_pw
        cfg.from_email = body.from_email
        cfg.from_name  = body.from_name
        cfg.use_tls    = body.use_tls
        cfg.updated_at = datetime.datetime.utcnow()
    else:
        cfg = models.SMTPConfig(
            id=1,
            host=body.host, port=body.port,
            username=body.username, password=encrypted_pw,
            from_email=body.from_email, from_name=body.from_name,
            use_tls=body.use_tls,
        )
        db.add(cfg)
    db.commit()
    db.refresh(cfg)
    return schemas.SMTPConfigOut(
        host=cfg.host, port=cfg.port, username=cfg.username,
        password="****", from_email=cfg.from_email,
        from_name=cfg.from_name, use_tls=cfg.use_tls, updated_at=cfg.updated_at,
    )


@app.post("/admin/smtp/test")
def test_smtp(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    _send_email(
        current_user.email,
        "JobTrackr SMTP Test",
        "This is a test email from your JobTrackr instance. SMTP is working correctly.",
        db,
        email_type="test",
        user_id=current_user.id,
    )
    return {"sent": True, "to": current_user.email}


# ── Digest config (per user) ──────────────────────────────────────────────────

def _get_or_create_digest(db, user_id: int) -> models.DigestConfig:
    cfg = db.query(models.DigestConfig).filter(models.DigestConfig.user_id == user_id).first()
    if not cfg:
        cfg = models.DigestConfig(user_id=user_id)
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


@app.get("/users/me/digest", response_model=schemas.DigestConfigOut)
def get_digest_config(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _get_or_create_digest(db, current_user.id)


@app.patch("/users/me/digest", response_model=schemas.DigestConfigOut)
def update_digest_config(
    body: schemas.DigestConfigUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cfg = _get_or_create_digest(db, current_user.id)
    if body.enabled is not None:
        cfg.enabled = body.enabled
    if body.frequency is not None:
        if body.frequency not in ("daily", "weekly", "never"):
            raise HTTPException(status_code=400, detail="frequency must be daily, weekly, or never")
        cfg.frequency = body.frequency
    if body.send_hour is not None:
        if not (0 <= body.send_hour <= 23):
            raise HTTPException(status_code=400, detail="send_hour must be 0–23")
        cfg.send_hour = body.send_hour
    db.commit()
    db.refresh(cfg)
    return cfg


# ── Admin email logs ──────────────────────────────────────────────────────────

@app.get("/admin/emails/", response_model=list[schemas.EmailLogOut])
def list_email_logs(
    email_type: str | None = None,
    page: int = 1,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    PAGE_SIZE = 30
    q = db.query(models.EmailLog).order_by(models.EmailLog.sent_at.desc())
    if email_type:
        q = q.filter(models.EmailLog.email_type == email_type)
    return q.offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()


# ── Admin system health ───────────────────────────────────────────────────────

@app.get("/admin/health/")
def system_health(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    report = {}

    # API
    report["api"] = {"status": "ok", "detail": "FastAPI responding"}

    # Database
    try:
        user_count = db.query(models.User).count()
        report["database"] = {"status": "ok", "detail": f"{user_count} users in DB"}
    except Exception as e:
        report["database"] = {"status": "error", "detail": str(e)}

    # Groq API key
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key:
        report["groq"] = {"status": "ok", "detail": "API key present"}
    else:
        report["groq"] = {"status": "unconfigured", "detail": "GROQ_API_KEY not set"}

    # APScheduler
    try:
        job_count = len(scheduler.get_jobs())
        s_status = "ok" if scheduler.running else "stopped"
        report["scheduler"] = {"status": s_status, "detail": f"{job_count} jobs scheduled"}
    except Exception as e:
        report["scheduler"] = {"status": "error", "detail": str(e)}

    # SMTP
    smtp_cfg = db.query(models.SMTPConfig).filter(models.SMTPConfig.id == 1).first()
    if smtp_cfg:
        report["smtp"] = {"status": "configured", "detail": f"{smtp_cfg.host}:{smtp_cfg.port}"}
    else:
        report["smtp"] = {"status": "unconfigured", "detail": "No SMTP config saved"}

    # Scrape cache
    try:
        cache_count = db.query(models.ScrapeCache).count()
        report["cache"] = {"status": "ok", "detail": f"{cache_count} cached URL entries"}
    except Exception as e:
        report["cache"] = {"status": "error", "detail": str(e)}

    # Disk (DB file size)
    try:
        db_url = os.getenv("DATABASE_URL", "sqlite:///./jobtrackr.db")
        db_path = db_url.replace("sqlite:////", "/").replace("sqlite:///", "")
        if os.path.exists(db_path):
            size_mb = os.path.getsize(db_path) / (1024 * 1024)
            d_status = "warn" if size_mb > 500 else "ok"
            report["disk"] = {"status": d_status, "detail": f"DB file: {size_mb:.1f} MB"}
        else:
            report["disk"] = {"status": "ok", "detail": "DB path not found (in-memory?)"}
    except Exception as e:
        report["disk"] = {"status": "error", "detail": str(e)}

    return report
