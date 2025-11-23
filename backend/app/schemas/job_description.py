"""Job description schemas."""

from datetime import datetime
from typing import Optional

from pydantic import UUID4, BaseModel


class JobDescriptionCreate(BaseModel):
    """Schema for creating a job description."""

    company_name: str
    job_title: str
    description_text: str  # New field for text input


class JobDescriptionResponse(BaseModel):
    """Schema for job description response."""

    id: UUID4
    user_id: UUID4
    company_name: str
    job_title: str
    status: str
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class JobDescriptionListResponse(BaseModel):
    """Schema for listing job descriptions."""

    id: UUID4
    company_name: str
    job_title: str
    status: str
    created_at: datetime
    total_questions: int = 0
    answered_questions: int = 0

    class Config:
        from_attributes = True
