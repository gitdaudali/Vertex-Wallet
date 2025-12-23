from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# Support SQLite for local development
connect_args = {}
if settings.DATABASE_URL and settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# For Vercel/serverless, use connection pooling
engine_kwargs = {
    "connect_args": connect_args,
    "pool_pre_ping": True,  # Verify connections before using
    "pool_recycle": 300,    # Recycle connections after 5 minutes
}

# In production/serverless, disable connection pooling issues
if os.getenv("VERCEL") or os.getenv("ENVIRONMENT") == "production":
    engine_kwargs["poolclass"] = None  # Disable pooling for serverless

# Create engine with error handling
try:
    db_url_preview = settings.DATABASE_URL[:20] if len(settings.DATABASE_URL) > 20 else settings.DATABASE_URL
    print(f"[DB] Connecting to database: {db_url_preview}...")  # Don't print full URL for security
    engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
    # Test connection
    with engine.connect() as conn:
        print("[DB] Database connection successful!")
except Exception as e:
    print(f"[DB] Database connection error: {str(e)}")
    import traceback
    traceback.print_exc()
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

