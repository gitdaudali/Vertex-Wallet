from pydantic import BaseModel, EmailStr
from datetime import datetime
from decimal import Decimal
from typing import Optional

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
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
    amount_btc: Optional[Decimal] = None
    amount_usd: Optional[float] = None
    description: Optional[str] = None
    expires_in_hours: int = 24

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

