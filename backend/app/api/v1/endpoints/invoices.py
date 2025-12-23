from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import Optional
from app.db.database import get_db
from app.db import models
from app.api.v1.dependencies import get_current_user
from app.api.v1.schemas import InvoiceCreate, InvoiceResponse, InvoiceListResponse
from app.services.invoice import create_invoice, get_invoice_qr_data

router = APIRouter()

@router.post(
    "/create", 
    response_model=InvoiceResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Create invoice",
    description="Create a new payment invoice with Bitcoin address and QR code",
    responses={
        201: {"description": "Invoice created successfully"},
        400: {"description": "Invalid request - must provide amount_btc or amount_usd"},
        401: {"description": "Authentication required"}
    }
)
async def create_invoice_endpoint(
    invoice_data: InvoiceCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new invoice.
    
    - **amount_btc**: Amount in Bitcoin (optional if amount_usd provided)
    - **amount_usd**: Amount in USD (optional if amount_btc provided)
    - **description**: Invoice description (optional)
    - **expires_in_hours**: Hours until invoice expires (default: 24)
    
    Returns invoice with Bitcoin address and QR code data.
    
    **Requires authentication.**
    """
    if not invoice_data.amount_btc and not invoice_data.amount_usd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either amount_btc or amount_usd must be provided"
        )
    
    # If only USD provided, convert to BTC (simplified - use real exchange rate in production)
    amount_btc = invoice_data.amount_btc
    if not amount_btc and invoice_data.amount_usd:
        # Placeholder conversion: 1 BTC = $50,000 (use real API in production)
        btc_price_usd = 50000
        amount_btc = Decimal(str(invoice_data.amount_usd)) / Decimal(str(btc_price_usd))
    
    invoice = create_invoice(
        db=db,
        user_id=current_user.id,
        amount_btc=amount_btc,
        amount_usd=invoice_data.amount_usd,
        description=invoice_data.description,
        expires_in_hours=invoice_data.expires_in_hours
    )
    
    qr_data = get_invoice_qr_data(invoice)
    
    return InvoiceResponse(
        id=invoice.id,
        btc_address=invoice.btc_address,
        amount_btc=invoice.amount_btc,
        amount_usd=invoice.amount_usd,
        status=invoice.status,
        description=invoice.description,
        qr_code_data=qr_data,
        expires_at=invoice.expires_at,
        created_at=invoice.created_at,
        paid_at=invoice.paid_at
    )

@router.get(
    "", 
    response_model=InvoiceListResponse,
    summary="List invoices",
    description="Get paginated list of invoices for the authenticated user",
    responses={
        200: {"description": "Invoices retrieved successfully"},
        401: {"description": "Authentication required"}
    }
)
async def get_invoices(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: pending, paid, expired"),
    limit: int = Query(10, ge=1, le=100, description="Number of invoices per page"),
    offset: int = Query(0, ge=0, description="Number of invoices to skip"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of invoices for the current user.
    
    Query parameters:
    - **status**: Filter by invoice status (pending, paid, expired)
    - **limit**: Number of invoices per page (1-100, default: 10)
    - **offset**: Number of invoices to skip for pagination (default: 0)
    
    **Requires authentication.**
    """
    query = db.query(models.Invoice).filter(models.Invoice.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(models.Invoice.status == status_filter)
    
    total = query.count()
    invoices = query.order_by(models.Invoice.created_at.desc()).offset(offset).limit(limit).all()
    
    invoice_responses = []
    for invoice in invoices:
        qr_data = get_invoice_qr_data(invoice)
        invoice_responses.append(InvoiceResponse(
            id=invoice.id,
            btc_address=invoice.btc_address,
            amount_btc=invoice.amount_btc,
            amount_usd=invoice.amount_usd,
            status=invoice.status,
            description=invoice.description,
            qr_code_data=qr_data,
            expires_at=invoice.expires_at,
            created_at=invoice.created_at,
            paid_at=invoice.paid_at
        ))
    
    return InvoiceListResponse(
        invoices=invoice_responses,
        total=total,
        limit=limit,
        offset=offset
    )

@router.get(
    "/{invoice_id}", 
    response_model=InvoiceResponse,
    summary="Get invoice details",
    description="Get detailed information about a specific invoice",
    responses={
        200: {"description": "Invoice details retrieved successfully"},
        401: {"description": "Authentication required"},
        404: {"description": "Invoice not found"}
    }
)
async def get_invoice(
    invoice_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get invoice details by ID.
    
    - **invoice_id**: The ID of the invoice to retrieve
    
    Returns complete invoice information including QR code data.
    Only returns invoices belonging to the authenticated user.
    
    **Requires authentication.**
    """
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Get confirmation count if transaction exists
    qr_data = get_invoice_qr_data(invoice)
    
    return InvoiceResponse(
        id=invoice.id,
        btc_address=invoice.btc_address,
        amount_btc=invoice.amount_btc,
        amount_usd=invoice.amount_usd,
        status=invoice.status,
        description=invoice.description,
        qr_code_data=qr_data,
        expires_at=invoice.expires_at,
        created_at=invoice.created_at,
        paid_at=invoice.paid_at
    )

