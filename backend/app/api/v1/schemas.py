from pydantic import BaseModel, EmailStr
from datetime import datetime
from decimal import Decimal
from typing import Optional

# Auth Schemas
class UserRegister(BaseModel):
    """User registration schema."""
    name: str = "John Doe"
    email: EmailStr = "user@example.com"
    password: str = "securepassword123"
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }

class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr = "test@example.com"
    password: str = "test123456"
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "test@example.com",
                "password": "test123456"
            }
        }

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None  # Make name optional to handle existing users
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Wallet Schemas
class WalletResponse(BaseModel):
    id: int
    btc_address: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AddressBalance(BaseModel):
    address: str
    balance: str

class WalletBalance(BaseModel):
    total_balance_btc: str
    confirmed_balance_btc: str
    pending_balance_btc: str
    total_received_btc: str
    addresses: list[AddressBalance]

# Invoice Schemas
class InvoiceCreate(BaseModel):
    """Invoice creation schema. Provide either amount_btc or amount_usd."""
    amount_btc: Optional[Decimal] = None
    amount_usd: Optional[float] = None
    description: Optional[str] = None
    expires_in_hours: int = 24
    
    class Config:
        json_schema_extra = {
            "example": {
                "amount_usd": 100.0,
                "description": "Payment for services",
                "expires_in_hours": 24
            }
        }

class InvoiceResponse(BaseModel):
    id: int
    btc_address: str
    amount_btc: Decimal
    amount_usd: Optional[float]
    status: str
    description: Optional[str]
    qr_code_data: Optional[str] = None
    expires_at: Optional[datetime]
    created_at: datetime
    paid_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class InvoiceListResponse(BaseModel):
    invoices: list[InvoiceResponse]
    total: int
    limit: int
    offset: int

# Transaction Schemas
class TransactionResponse(BaseModel):
    id: int
    tx_hash: str
    amount_btc: Decimal
    confirmations: int
    status: str
    btc_address: str
    created_at: datetime
    confirmed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class TransactionListResponse(BaseModel):
    transactions: list[TransactionResponse]
    total: int
    limit: int
    offset: int

