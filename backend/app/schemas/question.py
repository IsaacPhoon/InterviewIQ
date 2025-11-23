"""Question schemas."""

from datetime import datetime
from typing import Optional

from pydantic import UUID4, BaseModel


class QuestionResponse(BaseModel):
    """Schema for question response."""

    id: UUID4
    job_description_id: UUID4
    question_text: str
    created_at: datetime
    attempts_count: Optional[int] = 0
    last_score: Optional[float] = None

    class Config:
        from_attributes = True
