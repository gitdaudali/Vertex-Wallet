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
os.environ.setdefault("VERCEL", "1")

try:
    # Import FastAPI app
    from app.main import app
    
    # Import Mangum for AWS Lambda compatibility
    from mangum import Mangum
    
    # Create Mangum handler - Vercel Python runtime expects AWS Lambda format
    handler = Mangum(app, lifespan="off")
    
except Exception as e:
    import traceback
    print(f"ERROR initializing app: {str(e)}")
    print(traceback.format_exc())
    
    # Fallback: create minimal error app
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    fallback_app = FastAPI()
    
    @fallback_app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def fallback_handler(full_path: str):
        return JSONResponse(
            status_code=500,
            content={"error": "App initialization failed", "message": str(e)}
        )
    
    try:
        from mangum import Mangum
        handler = Mangum(fallback_app, lifespan="off")
    except:
        handler = fallback_app
