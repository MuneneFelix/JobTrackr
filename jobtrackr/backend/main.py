from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
from passlib.context import CryptContext
import models, schemas, jobtrackr.backend.database as database

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# Scheduler for periodic scraping
scheduler = BackgroundScheduler()

def scrape_jobs_task():
    """
    This function will be called periodically.
    Logic to iterate through JobSources and scrape URLs goes here.
    """
    print("Checking for new jobs...")
    # TODO: Implement scraping logic

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start scheduler on startup
    scheduler.add_job(scrape_jobs_task, 'interval', hours=1) # Default check every hour
    scheduler.start()
    yield
    # Shutdown scheduler
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

# CORS - Allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "JobTrackr API is running"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    return {"access_token": user.email, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.UserBase)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/sources/", response_model=schemas.JobSource)
def create_job_source(source: schemas.JobSourceCreate, db: Session = Depends(get_db)):
    # TODO: Get actual current user ID from auth token
    # For now, hardcoding user_id=1 for testing
    db_source = models.JobSource(**source.dict(), owner_id=1)
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source