"""
Vercel serverless function entry point for FastAPI
Vercel Python runtime requires AWS Lambda compatible handler
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

# Initialize handler variable
_mangum = None

try:
    # Import FastAPI app
    from app.main import app
    
    # Import Mangum for AWS Lambda compatibility
    from mangum import Mangum
    
    # Create Mangum handler instance
    _mangum = Mangum(app, lifespan="off")
    
except Exception as e:
    import traceback
    print(f"ERROR initializing app: {str(e)}")
    print(traceback.format_exc())
    
    # Fallback: create minimal error app
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    error_app = FastAPI()
    
    @error_app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def error_handler(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "App initialization failed",
                "message": str(e),
                "traceback": traceback.format_exc()
            }
        )
    
    try:
        from mangum import Mangum
        _mangum = Mangum(error_app, lifespan="off")
    except:
        _mangum = error_app

# Vercel Python runtime expects handler to be a callable function
# that accepts (event, context) and returns Lambda response
def handler(event, context):
    """AWS Lambda compatible handler wrapper for Vercel"""
    if _mangum:
        return _mangum(event, context)
    else:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": '{"error": "Handler not initialized"}'
        }
