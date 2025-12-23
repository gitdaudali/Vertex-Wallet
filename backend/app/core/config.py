from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import field_validator
import json
import os

class Settings(BaseSettings):
    # Database - allow empty for development (will use SQLite if not set)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vertex_wallet.db")
    
    # JWT - generate a default for development if not set
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-min-32-chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Blockchain API - allow empty for development
    BLOCKCYPHER_API_KEY: str = os.getenv("BLOCKCYPHER_API_KEY", "dev-api-key")
    BLOCKCHAIN_NETWORK: str = "test3"  # test3 for testnet, main for mainnet
    WEBHOOK_SECRET: str = os.getenv("WEBHOOK_SECRET", "dev-webhook-secret")
    
    # Server
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: Union[str, List[str]] = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    
    # Bitcoin
    MIN_CONFIRMATIONS: int = 1
    RECOMMENDED_CONFIRMATIONS: int = 6
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            # Try to parse as JSON first
            if v.strip().startswith('['):
                try:
                    return json.loads(v)
                except:
                    pass
            # Fallback to comma-separated
            origins = [origin.strip() for origin in v.split(',') if origin.strip()]
            if origins:
                return origins
            # Single value
            return [v] if v else ["http://localhost:5173"]
        return v
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        if isinstance(self.CORS_ORIGINS, str):
            # Try to parse as JSON array first
            if self.CORS_ORIGINS.strip().startswith('['):
                try:
                    parsed = json.loads(self.CORS_ORIGINS)
                    if isinstance(parsed, list):
                        return parsed
                except json.JSONDecodeError:
                    pass
            # Fallback to comma-separated values
            origins = [origin.strip() for origin in self.CORS_ORIGINS.split(',') if origin.strip()]
            if origins:
                return origins
            # Single value
            return [self.CORS_ORIGINS]
        elif isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        else:
            return ["http://localhost:5173"]  # Default fallback
    
    def validate_required(self):
        """Validate that required fields are set."""
        errors = []
        if not self.DATABASE_URL or self.DATABASE_URL == "":
            errors.append("DATABASE_URL is required")
        if not self.SECRET_KEY or self.SECRET_KEY == "":
            errors.append("SECRET_KEY is required")
        if not self.BLOCKCYPHER_API_KEY or self.BLOCKCYPHER_API_KEY == "":
            errors.append("BLOCKCYPHER_API_KEY is required")
        if not self.WEBHOOK_SECRET or self.WEBHOOK_SECRET == "":
            errors.append("WEBHOOK_SECRET is required")
        
        # In development, only warn if using default values
        if errors and os.getenv("ENVIRONMENT", "development") == "development":
            # Check if using default dev values
            if self.SECRET_KEY == "dev-secret-key-change-in-production-min-32-chars":
                print("⚠️ Using default SECRET_KEY for development. Change in production!")
            if self.BLOCKCYPHER_API_KEY == "dev-api-key":
                print("⚠️ Using default BLOCKCYPHER_API_KEY for development. Set real API key in production!")
            if self.WEBHOOK_SECRET == "dev-webhook-secret":
                print("⚠️ Using default WEBHOOK_SECRET for development. Change in production!")
            # Don't raise error in development, just warn
            return
        
        if errors:
            raise ValueError(f"Missing required settings: {', '.join(errors)}")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # Allow reading from environment variables (for Vercel)
        env_file_encoding = 'utf-8'
        # Don't fail if .env file doesn't exist (for Vercel)
        env_file_required = False

settings = Settings()

# Don't validate on import - let the app start and validate when needed
# This prevents crashes during import if .env file is missing
