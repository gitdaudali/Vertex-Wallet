from fastapi import APIRouter, Request, HTTPException, status, Header, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
from typing import Optional
from app.db.database import get_db
from app.db import models
from app.services.blockchain import blockchain_service
from app.core.config import settings
import hmac
import hashlib
import json

router = APIRouter()

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify webhook signature."""
    expected_signature = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)

@router.post("/blockchain")
async def blockchain_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Handle blockchain webhook from BlockCypher.
    This endpoint receives notifications when transactions are detected.
    """
    body = await request.body()
    
    # Verify webhook signature (if provided)
    if x_webhook_signature and settings.WEBHOOK_SECRET:
        if not verify_webhook_signature(body, x_webhook_signature, settings.WEBHOOK_SECRET):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature"
            )
    
    try:
        data = await request.json()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    
    # Extract transaction data from webhook
    address = data.get("address")
    tx_hash = data.get("hash") or data.get("tx_hash")
    confirmations = data.get("confirmations", 0)
    
    if not address or not tx_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields: address or tx_hash"
        )
    
    # Find wallet by address
    wallet = db.query(models.Wallet).filter(models.Wallet.btc_address == address).first()
    if not wallet:
        # Address not found in our system - ignore
        return {"status": "ignored", "message": "Address not found"}
    
    # Check if transaction already exists
    existing_tx = db.query(models.Transaction).filter(models.Transaction.tx_hash == tx_hash).first()
    if existing_tx:
        # Update confirmations
        existing_tx.confirmations = confirmations
        if confirmations >= settings.MIN_CONFIRMATIONS and existing_tx.status == "pending":
            existing_tx.status = "confirmed"
            existing_tx.confirmed_at = datetime.utcnow()
        db.commit()
        return {"status": "updated", "message": "Transaction confirmations updated"}
    
    # Get transaction details from BlockCypher
    try:
        tx_details = blockchain_service.get_transaction(tx_hash)
    except Exception as e:
        # If we can't get details, still record basic info
        tx_details = {}
    
    # Calculate amount received (simplified - check outputs to our address)
    amount_satoshi = 0
    if "outputs" in tx_details:
        for output in tx_details.get("outputs", []):
            if output.get("addresses") and address in output.get("addresses", []):
                amount_satoshi += output.get("value", 0)
    
    amount_btc = blockchain_service.satoshi_to_btc(amount_satoshi)
    
    if amount_btc == 0:
        return {"status": "ignored", "message": "No payment to this address"}
    
    # Create transaction record
    transaction = models.Transaction(
        wallet_id=wallet.id,
        tx_hash=tx_hash,
        amount_btc=amount_btc,
        confirmations=confirmations,
        status="confirmed" if confirmations >= settings.MIN_CONFIRMATIONS else "pending",
        block_height=data.get("block_height"),
        confirmed_at=datetime.utcnow() if confirmations >= settings.MIN_CONFIRMATIONS else None
    )
    
    db.add(transaction)
    
    # Update invoice status if exists
    invoice = db.query(models.Invoice).filter(
        models.Invoice.btc_address == address,
        models.Invoice.status == "pending"
    ).first()
    
    if invoice:
        # Check if amount matches (with small tolerance)
        amount_diff = abs(invoice.amount_btc - amount_btc)
        if amount_diff <= Decimal("0.00001"):  # Small tolerance for fees
            invoice.status = "paid"
            invoice.paid_at = datetime.utcnow()
            transaction.invoice_id = invoice.id
    
    db.commit()
    db.refresh(transaction)
    
    return {
        "status": "processed",
        "message": "Transaction recorded",
        "transaction_id": transaction.id
    }

