"""Response score model."""

import uuid
from datetime import datetime

from app.core.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship


class ResponseScore(Base):
    """Evaluation scores for a response."""

    __tablename__ = 'response_scores'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    response_id = Column(
        UUID(as_uuid=True),
        ForeignKey('responses.id', ondelete='CASCADE'),
        unique=True,
        nullable=False,
    )

    # Raw JSON from Claude
    scores_json = Column(JSONB, nullable=False)

    # Denormalized scores for easier querying (1-10)
    score_confidence = Column(Integer, nullable=True)
    score_clarity_structure = Column(Integer, nullable=True)
    score_technical_depth = Column(Integer, nullable=True)
    score_communication_skills = Column(Integer, nullable=True)
    score_relevance = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    response = relationship('Response', back_populates='score')

    def __repr__(self):
        return f'<ResponseScore(id={self.id}, response_id={self.response_id})>'
