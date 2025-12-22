from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

# Note: Database tables are now managed by Alembic migrations
# Run: alembic upgrade head

app = FastAPI(
    title="Vertex Wallet API",
    description="Bitcoin payment wallet",
    version="1.0.0"
)

# CORS middleware - explicitly allow frontend origin
cors_origins = settings.cors_origins_list
# Ensure localhost:5173 is always included for development
if "http://localhost:5173" not in cors_origins:
    cors_origins.append("http://localhost:5173")

# Debug: Print CORS origins (remove in production)
print(f"🔧 CORS Origins configured: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Vertex Wallet API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

