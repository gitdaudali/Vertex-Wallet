from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import field_validator
import json

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Blockchain API
    BLOCKCYPHER_API_KEY: str
    BLOCKCHAIN_NETWORK: str = "test3"  # test3 for testnet, main for mainnet
    WEBHOOK_SECRET: str
    
    # Server
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173"
    
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
            return [origin.strip() for origin in v.split(',') if origin.strip()]
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
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

