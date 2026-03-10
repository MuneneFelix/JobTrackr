import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Reads DATABASE_URL from env (set via systemd EnvironmentFile or docker-compose).
# Falls back to local sqlite for dev.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./jobtrackr.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()