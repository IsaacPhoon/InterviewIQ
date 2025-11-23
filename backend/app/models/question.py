"""Question model."""

import uuid
from datetime import datetime, timezone

from app.core.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class Question(Base):
    """Interview question model."""

    __tablename__ = 'questions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_description_id = Column(
        UUID(as_uuid=True),
        ForeignKey('job_descriptions.id', ondelete='CASCADE'),
        nullable=False,
    )
    user_id = Column(
        UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False
    )
    question_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    job_description = relationship('JobDescription', back_populates='questions')
    user = relationship('User', back_populates='questions')
    responses = relationship(
        'Response', back_populates='question', cascade='all, delete-orphan'
    )

    def __repr__(self):
        return f'<Question(id={self.id}, text={self.question_text[:50]}...)>'
