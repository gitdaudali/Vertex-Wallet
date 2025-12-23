from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from decimal import Decimal
from app.db.database import get_db
from app.db import models
from app.api.v1.dependencies import get_current_user
from app.api.v1.schemas import WalletResponse, WalletBalance
from app.services.blockchain import blockchain_service
from app.core.config import settings

router = APIRouter()

@router.post(
    "/generate", 
    response_model=WalletResponse,
    summary="Generate Bitcoin address",
    description="Generate a new Bitcoin receiving address for the authenticated user",
    responses={
        200: {"description": "Wallet address generated successfully"},
        401: {"description": "Authentication required"}
    }
)
async def generate_wallet_address(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a new BTC receiving address.
    
    If the user already has a wallet, returns the existing wallet address.
    Otherwise, generates a new Bitcoin address using BlockCypher API.
    
    **Requires authentication.**
    """
    # Check if user already has a wallet
    existing_wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    if existing_wallet:
        return existing_wallet
    
    # Generate new address
    address_data = blockchain_service.generate_address()
    
    wallet = models.Wallet(
        user_id=current_user.id,
        btc_address=address_data["address"],
        address_index=0
    )
    
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    
    return wallet

@router.get(
    "/balance", 
    response_model=WalletBalance,
    summary="Get wallet balance",
    description="Get total balance, confirmed balance, pending balance, and address details",
    responses={
        200: {"description": "Wallet balance retrieved successfully"},
        401: {"description": "Authentication required"}
    }
)
async def get_wallet_balance(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get wallet balance and transaction summary.
    
    Returns:
    - **total_balance_btc**: Total balance across all addresses
    - **confirmed_balance_btc**: Balance with required confirmations
    - **pending_balance_btc**: Balance pending confirmation
    - **total_received_btc**: Total amount ever received
    - **addresses**: List of addresses with their balances
    
    **Requires authentication.**
    """
    wallets = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).all()
    
    if not wallets:
        return {
            "total_balance_btc": "0",
            "confirmed_balance_btc": "0",
            "pending_balance_btc": "0",
            "total_received_btc": "0",
            "addresses": []
        }
    
    total_balance = Decimal("0")
    confirmed_balance = Decimal("0")
    pending_balance = Decimal("0")
    total_received = Decimal("0")
    address_balances = []
    
    for wallet in wallets:
        # Get transactions for this wallet
        transactions = db.query(models.Transaction).filter(
            models.Transaction.wallet_id == wallet.id
        ).all()
        
        wallet_balance = Decimal("0")
        wallet_confirmed = Decimal("0")
        wallet_pending = Decimal("0")
        
        for tx in transactions:
            total_received += tx.amount_btc
            wallet_balance += tx.amount_btc
            
            if tx.confirmations >= settings.MIN_CONFIRMATIONS:
                wallet_confirmed += tx.amount_btc
                confirmed_balance += tx.amount_btc
            else:
                wallet_pending += tx.amount_btc
                pending_balance += tx.amount_btc
        
        total_balance += wallet_balance
        
        address_balances.append({
            "address": wallet.btc_address,
            "balance": str(wallet_balance)
        })
    
    return {
        "total_balance_btc": str(total_balance),
        "confirmed_balance_btc": str(confirmed_balance),
        "pending_balance_btc": str(pending_balance),
        "total_received_btc": str(total_received),
        "addresses": address_balances
    }

