"""
Vercel entry point - exports FastAPI app for @vercel/python
"""
from app.main import app

# Export app for Vercel ASGI handler
__all__ = ["app"]

