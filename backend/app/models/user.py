"""User model."""

import uuid
from datetime import datetime

from app.core.database import Base
from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class User(Base):
    """User model for authentication and ownership."""

    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    job_descriptions = relationship(
        'JobDescription', back_populates='user', cascade='all, delete-orphan'
    )
    questions = relationship(
        'Question', back_populates='user', cascade='all, delete-orphan'
    )
    responses = relationship(
        'Response', back_populates='user', cascade='all, delete-orphan'
    )

    def __repr__(self):
        return f'<User(id={self.id}, email={self.email})>'
