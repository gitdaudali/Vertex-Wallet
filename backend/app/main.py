from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.api import api_router
import os
import traceback

# Validate settings before starting app
# In development, allow missing settings (they might be in .env file)
try:
    settings.validate_required()
except ValueError as e:
    if os.getenv("VERCEL"):
        # In Vercel, log the error but don't fail (environment variables should be set)
        print(f"⚠️ Configuration warning: {e}")
    elif os.getenv("ENVIRONMENT", "development") == "development":
        # In development, just warn but don't fail
        print(f"⚠️ Configuration warning: {e}")
        print("⚠️ Some features may not work until all environment variables are set.")
    else:
        raise

# Note: Database tables are now managed by Alembic migrations
# Run: alembic upgrade head

app = FastAPI(
    title="Vertex Wallet API",
    description="""
    ## Bitcoin Payment Wallet API
    
    A secure, non-custodial Bitcoin payment wallet system with invoice management.
    
    ### Features:
    - 🔐 User authentication with JWT tokens
    - 💰 Bitcoin wallet address generation
    - 📄 Invoice creation and management
    - 📊 Transaction tracking
    - 🔔 Webhook support for payment notifications
    
    ### Authentication:
    Most endpoints require authentication. Register a user first, then login to get an access token.
    Use the token in the Authorization header: `Bearer <your-token>`
    
    ### Testing:
    Use the test users after seeding the database:
    - Email: `test@example.com`
    - Password: `test123456`
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler to catch all errors and return proper CORS headers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to ensure CORS headers are always sent."""
    print(f"[ERROR] Unhandled exception: {str(exc)}")
    print(traceback.format_exc())
    
    # Get origin from request headers
    origin = request.headers.get("origin")
    # If origin is in allowed list, use it; otherwise use first allowed origin or wildcard
    allowed_origin = origin if origin and origin in cors_origins else (cors_origins[0] if cors_origins else "*")
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal server error: {str(exc)}",
            "type": type(exc).__name__
        },
        headers={
            "Access-Control-Allow-Origin": allowed_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/test")
async def test_endpoint():
    """Test endpoint to verify backend is responding."""
    return {"message": "Backend is responding", "status": "ok"}

