from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# Lazy initialization to prevent cold-start crashes in Vercel
_engine = None
_SessionLocal = None

def get_engine():
    """Lazy initialization of database engine."""
    global _engine
    if _engine is None:
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
            # For serverless, use NullPool to avoid connection pooling issues
            from sqlalchemy.pool import NullPool
            engine_kwargs["poolclass"] = NullPool
            engine_kwargs.pop("pool_pre_ping", None)
            engine_kwargs.pop("pool_recycle", None)

        # Create engine with error handling
        db_url_preview = settings.DATABASE_URL[:20] if len(settings.DATABASE_URL) > 20 else settings.DATABASE_URL
        print(f"[DB] Initializing database engine: {db_url_preview}...")  # Don't print full URL for security

        try:
            _engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
            
            # Only test connection in non-serverless environments
            if not os.getenv("VERCEL"):
                try:
                    with _engine.connect() as conn:
                        print("[DB] Database connection successful!")
                except Exception as e:
                    print(f"[DB] Database connection warning: {str(e)}")
                    # Don't raise in development, just warn
                    if os.getenv("ENVIRONMENT") == "production" and not os.getenv("VERCEL"):
                        raise
        except Exception as e:
            print(f"[DB] Database engine creation error: {str(e)}")
            import traceback
            traceback.print_exc()
            # In serverless, don't fail at import time
            if not os.getenv("VERCEL"):
                raise
    
    return _engine

def get_session_local():
    """Lazy initialization of sessionmaker."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal

# For backward compatibility, use properties that lazy-load
# This allows scripts to use SessionLocal() directly while preventing cold-start crashes
class _LazyEngine:
    """Lazy wrapper for engine to prevent import-time initialization."""
    def __getattr__(self, name):
        return getattr(get_engine(), name)

class _LazySessionLocal:
    """Lazy wrapper for SessionLocal to prevent import-time initialization."""
    def __call__(self, *args, **kwargs):
        return get_session_local()(*args, **kwargs)
    def __getattr__(self, name):
        return getattr(get_session_local(), name)

# Export lazy wrappers
engine = _LazyEngine()
SessionLocal = _LazySessionLocal()

# Initialize on first import for non-Vercel environments (for scripts)
if not os.getenv("VERCEL"):
    _ = get_engine()  # Initialize engine
    _ = get_session_local()  # Initialize SessionLocal

Base = declarative_base()

def get_db():
    """Dependency for getting database session."""
    # Use lazy initialization
    session_local = get_session_local()
    db = session_local()
    try:
        yield db
    finally:
        db.close()

