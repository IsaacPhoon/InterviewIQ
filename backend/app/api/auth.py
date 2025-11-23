"""Authentication API endpoints."""

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import LoginRequest, Token, UserCreate, UserResponse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix='/api/auth', tags=['Authentication'])


@router.post('/register', response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        JWT access token

    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered'
        )

    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(email=user_data.email, password_hash=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create access token
    access_token = create_access_token(data={'sub': str(new_user.id)})

    return Token(access_token=access_token)


@router.post('/login', response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login user and return JWT token.

    Args:
        login_data: Login credentials
        db: Database session

    Returns:
        JWT access token

    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials'
        )

    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials'
        )

    # Create access token
    access_token = create_access_token(data={'sub': str(user.id)})

    return Token(access_token=access_token)
