"""Response and evaluation schemas."""

from datetime import datetime
from typing import Optional

from pydantic import UUID4, BaseModel


class ResponseCreate(BaseModel):
    """Schema for creating a response (used internally)."""

    question_id: UUID4
    audio_path: str
    transcript: str


class ScoresResponse(BaseModel):
    """Schema for evaluation scores."""

    confidence: int
    clarity_structure: int
    technical_depth: int
    communication_skills: int
    relevance: int


class FeedbackResponse(BaseModel):
    """Schema for evaluation feedback."""

    confidence: str
    clarity_structure: str
    technical_depth: str
    communication_skills: str
    relevance: str


class EvaluationResponse(BaseModel):
    """Schema for complete evaluation response."""

    scores: ScoresResponse
    feedback: FeedbackResponse
    overall_comment: Optional[str] = None


class ResponseResponse(BaseModel):
    """Schema for response with evaluation."""

    response_id: UUID4
    transcript: str
    scores: ScoresResponse
    feedback: FeedbackResponse
    overall_comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ResponseListItem(BaseModel):
    """Schema for listing responses."""

    response_id: UUID4
    created_at: datetime
    scores: ScoresResponse

    class Config:
        from_attributes = True
