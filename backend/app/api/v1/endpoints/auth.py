from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.database import get_db
from app.db import models
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.api.v1.schemas import UserRegister, UserLogin, Token, UserResponse

router = APIRouter()

@router.post(
    "/register", 
    response_model=UserResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account. Password must be at least 8 characters long.",
    responses={
        201: {"description": "User successfully registered"},
        400: {"description": "Email already registered or validation error"}
    }
)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    - **name**: Full name of the user
    - **email**: Valid email address (will be normalized to lowercase)
    - **password**: Password (minimum 8 characters)
    
    Returns the created user object.
    """
    try:
        # Check if user already exists
        existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate password length
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Validate name
        if not user_data.name or len(user_data.name.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name is required"
            )
        
        # Create new user
        user = models.User(
            name=user_data.name.strip(),
            email=user_data.email.lower().strip(),
            password_hash=get_password_hash(user_data.password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post(
    "/login", 
    response_model=Token,
    summary="Login user",
    description="Authenticate user and receive JWT access token",
    responses={
        200: {"description": "Login successful, returns access token"},
        401: {"description": "Invalid email or password"}
    }
)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login and get access token.
    
    - **email**: User email address
    - **password**: User password
    
    Returns JWT access token and user information.
    Use the token in Authorization header: `Bearer <access_token>`
    """
    print(f"[LOGIN] Login attempt for: {credentials.email}")  # Debug log
    try:
        # Normalize email
        email = credentials.email.lower().strip()
        print(f"[LOGIN] Normalized email: {email}")  # Debug log
        
        # Find user
        print(f"[LOGIN] Querying database for user...")  # Debug log
        try:
            # Test database connection first
            from sqlalchemy import text
            db.execute(text("SELECT 1"))
            print(f"[LOGIN] Database connection OK")
            
            user = db.query(models.User).filter(models.User.email == email).first()
            print(f"[LOGIN] User found: {user is not None}")  # Debug log
            if user:
                print(f"[LOGIN] User ID: {user.id}, Email: {user.email}, Name: {user.name}")
        except Exception as db_error:
            print(f"[LOGIN] Database query error: {str(db_error)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(db_error)}"
            )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        
        # Convert user to UserResponse schema explicitly
        from app.api.v1.schemas import UserResponse
        user_response = UserResponse(
            id=user.id,
            name=user.name if hasattr(user, 'name') and user.name else None,
            email=user.email,
            created_at=user.created_at
        )
        
        print(f"[LOGIN] Login successful for user: {user.email}")  # Debug log
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

