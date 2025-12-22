from fastapi import APIRouter
from app.api.v1.endpoints import auth, wallets, invoices, transactions, webhooks

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(wallets.router, prefix="/wallets", tags=["wallets"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

