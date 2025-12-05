"""Job description model."""

import enum
import uuid
from datetime import datetime, timezone

from app.core.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class JobDescriptionStatus(enum.Enum):
    """Status of job description processing."""

    PENDING = 'pending'
    QUESTIONS_GENERATED = 'questions_generated'
    ERROR = 'error'


class JobDescription(Base):
    """Job description model."""

    __tablename__ = 'job_descriptions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False
    )
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    description_text = Column(Text, nullable=False)
    status = Column(
        SQLEnum(JobDescriptionStatus),
        default=JobDescriptionStatus.PENDING,
        nullable=False,
    )
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship('User', back_populates='job_descriptions')
    questions = relationship(
        'Question', back_populates='job_description', cascade='all, delete-orphan'
    )

    def __repr__(self):
        return f'<JobDescription(id={self.id}, company={self.company_name}, title={self.job_title})>'
