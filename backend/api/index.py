"""
Vercel serverless function entry point for FastAPI
"""
import sys
import os

# Add parent directory to path so we can import app
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set environment to production for Vercel
os.environ.setdefault("ENVIRONMENT", "production")

try:
    # Import FastAPI app
    from app.main import app
    
    # For Vercel, we need to export the app directly
    # Vercel's Python runtime will handle ASGI apps automatically
    handler = app
    
except Exception as e:
    # Log error for debugging in Vercel logs
    import traceback
    error_msg = f"ERROR: Failed to initialize FastAPI app: {str(e)}\n{traceback.format_exc()}"
    print(error_msg)
    
    # Create a minimal error handler
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    error_app = FastAPI()
    
    @error_app.get("/{full_path:path}")
    async def error_handler(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to initialize application",
                "message": str(e),
                "path": full_path
            }
        )
    
    handler = error_app
