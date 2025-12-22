from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session
from app.db import models
from app.services.blockchain import blockchain_service

def create_invoice(
    db: Session,
    user_id: int,
    amount_btc: Decimal,
    amount_usd: Optional[float] = None,
    description: Optional[str] = None,
    expires_in_hours: int = 24
) -> models.Invoice:
    """Create a new invoice with a BTC address."""
    # Get or create a wallet for the user
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user_id).first()
    
    if not wallet:
        # Generate new address
        address_data = blockchain_service.generate_address()
        wallet = models.Wallet(
            user_id=user_id,
            btc_address=address_data["address"],
            address_index=0
        )
        db.add(wallet)
        db.flush()
    
    # Create invoice
    expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
    
    invoice = models.Invoice(
        user_id=user_id,
        wallet_id=wallet.id,
        btc_address=wallet.btc_address,
        amount_btc=amount_btc,
        amount_usd=amount_usd,
        description=description,
        expires_at=expires_at,
        status="pending"
    )
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    return invoice

def get_invoice_qr_data(invoice: models.Invoice) -> str:
    """Generate Bitcoin URI for QR code."""
    amount_str = str(invoice.amount_btc)
    return f"bitcoin:{invoice.btc_address}?amount={amount_str}"

