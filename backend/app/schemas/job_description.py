"""Job description schemas."""

from datetime import datetime
from typing import Optional

from app.core.constants import (
    JOB_DESCRIPTION_COMPANY_NAME_MAX_LENGTH,
    JOB_DESCRIPTION_JOB_TITLE_MAX_LENGTH,
    JOB_DESCRIPTION_TEXT_MAX_LENGTH,
    JOB_DESCRIPTION_TEXT_MIN_LENGTH,
)
from pydantic import UUID4, BaseModel, Field, field_validator


class JobDescriptionCreate(BaseModel):
    """Schema for creating a job description."""

    company_name: str = Field(..., min_length=1, max_length=JOB_DESCRIPTION_COMPANY_NAME_MAX_LENGTH)
    job_title: str = Field(..., min_length=1, max_length=JOB_DESCRIPTION_JOB_TITLE_MAX_LENGTH)
    description_text: str = Field(..., min_length=JOB_DESCRIPTION_TEXT_MIN_LENGTH, max_length=JOB_DESCRIPTION_TEXT_MAX_LENGTH)

    @field_validator('description_text')
    @classmethod
    def validate_description_text(cls, v: str) -> str:
        """Validate description text is not just whitespace."""
        if not v.strip():
            raise ValueError('Description text cannot be empty or whitespace only')
        return v


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
