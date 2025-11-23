"""User schemas."""

from datetime import datetime

from pydantic import UUID4, BaseModel, EmailStr


class UserCreate(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response."""

    id: UUID4
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for authentication token."""

    access_token: str
    token_type: str = 'bearer'


class LoginRequest(BaseModel):
    """Schema for login request."""

    email: EmailStr
    password: str
