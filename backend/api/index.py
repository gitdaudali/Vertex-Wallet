"""
Vercel serverless function entry point for FastAPI
Using Mangum adapter for AWS Lambda/Vercel compatibility
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

try:
    # Import FastAPI app
    from app.main import app
    
    # Import Mangum adapter for AWS Lambda/Vercel compatibility
    from mangum import Mangum
    
    # Create Mangum handler - this converts ASGI app to AWS Lambda format
    # Vercel Python runtime expects this format
    handler = Mangum(app, lifespan="off")
    
except Exception as e:
    import traceback
    print(f"ERROR: Failed to initialize FastAPI app: {str(e)}")
    print(traceback.format_exc())
    
    # Create minimal error handler
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    from mangum import Mangum
    
    error_app = FastAPI()
    
    @error_app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def error_handler(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Application initialization failed",
                "message": str(e),
                "traceback": traceback.format_exc()
            }
        )
    
    # Wrap error app with Mangum
    try:
        handler = Mangum(error_app, lifespan="off")
    except:
        # Last resort: export FastAPI app directly
        handler = error_app
