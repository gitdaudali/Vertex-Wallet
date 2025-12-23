"""
Vercel serverless function entry point for FastAPI
Vercel Python runtime (@vercel/python) supports ASGI apps directly
"""
import sys
import os

# Add parent directory to path so we can import app
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set environment to production for Vercel
os.environ.setdefault("ENVIRONMENT", "production")
os.environ.setdefault("VERCEL", "1")

# Initialize handler variable to ensure it's always defined
handler = None

try:
    # Import FastAPI app
    # Vercel Python runtime (@vercel/python) handles ASGI apps natively
    from app.main import app
    
    # Export the FastAPI app directly
    # Vercel's @vercel/python builder will detect this as an ASGI app
    handler = app
    
except Exception as e:
    import traceback
    print(f"ERROR: Failed to import FastAPI app: {str(e)}")
    print(traceback.format_exc())
    
    # Create minimal error handler to prevent Vercel from crashing
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    error_app = FastAPI()
    
    @error_app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def error_handler(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Application initialization failed",
                "message": str(e)
            }
        )
    
    handler = error_app

# Ensure handler is always defined (required by Vercel)
if handler is None:
    from fastapi import FastAPI
    handler = FastAPI()
