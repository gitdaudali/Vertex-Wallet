from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db import models
from app.api.v1.dependencies import get_current_user
from app.api.v1.schemas import TransactionResponse, TransactionListResponse

router = APIRouter()

@router.get("", response_model=TransactionListResponse)
async def get_transactions(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transaction history for the current user."""
    # Get user's wallets
    wallets = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).all()
    wallet_ids = [w.id for w in wallets]
    
    if not wallet_ids:
        return TransactionListResponse(
            transactions=[],
            total=0,
            limit=limit,
            offset=offset
        )
    
    # Query transactions
    query = db.query(models.Transaction).filter(models.Transaction.wallet_id.in_(wallet_ids))
    
    if status_filter:
        query = query.filter(models.Transaction.status == status_filter)
    
    total = query.count()
    transactions = query.order_by(models.Transaction.created_at.desc()).offset(offset).limit(limit).all()
    
    transaction_responses = []
    for tx in transactions:
        transaction_responses.append(TransactionResponse(
            id=tx.id,
            tx_hash=tx.tx_hash,
            amount_btc=tx.amount_btc,
            confirmations=tx.confirmations,
            status=tx.status,
            btc_address=tx.wallet.btc_address,
            created_at=tx.created_at,
            confirmed_at=tx.confirmed_at
        ))
    
    return TransactionListResponse(
        transactions=transaction_responses,
        total=total,
        limit=limit,
        offset=offset
    )

