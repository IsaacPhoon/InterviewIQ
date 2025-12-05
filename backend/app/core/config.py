"""Application configuration using Pydantic settings."""

import json
import os
from pathlib import Path
from typing import Optional

from app.core.constants import (
    JOB_DESCRIPTION_COMPANY_NAME_MAX_LENGTH,
    JOB_DESCRIPTION_JOB_TITLE_MAX_LENGTH,
    JOB_DESCRIPTION_TEXT_MAX_LENGTH,
    JOB_DESCRIPTION_TEXT_MIN_LENGTH,
    MAX_AUDIO_DURATION_MINUTES,
    MAX_AUDIO_SIZE_MB,
)
from dotenv import load_dotenv
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = 'InterviewIQ'
    app_version: str = '1.0.0'
    debug: bool = False

    # Database
    @computed_field
    @property
    def database_url(self) -> str:
        """Get database URL, converting postgres:// to postgresql:// for Heroku compatibility."""
        _raw_database_url = os.environ.get('DATABASE_URL', '')
        if not _raw_database_url:
            raise ValueError("DATABASE_URL environment variable is not set")
        if _raw_database_url.startswith("postgres://"):
            _raw_database_url = _raw_database_url.replace("postgres://", "postgresql://", 1)
        return _raw_database_url

    # Security
    jwt_secret: str
    jwt_algorithm: str = 'HS256'
    jwt_expiration_hours: int = 2

    # AI Services
    claude_api_key: str
    claude_model: str = 'claude-sonnet-4-5-20250929'

    # Storage
    max_audio_size_mb: int = MAX_AUDIO_SIZE_MB
    max_audio_duration_minutes: int = MAX_AUDIO_DURATION_MINUTES

    # Job Description limits
    job_description_company_name_max_length: int = JOB_DESCRIPTION_COMPANY_NAME_MAX_LENGTH
    job_description_job_title_max_length: int = JOB_DESCRIPTION_JOB_TITLE_MAX_LENGTH
    job_description_text_min_length: int = JOB_DESCRIPTION_TEXT_MIN_LENGTH
    job_description_text_max_length: int = JOB_DESCRIPTION_TEXT_MAX_LENGTH

    # Cloudflare R2 Storage (Required)
    r2_endpoint_url: str
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket_name: str
    r2_public_url: Optional[str] = None  # Optional: Custom domain for public access

    # Whisper
    whisper_model: str = 'base.en'
    whisper_device: str = 'cpu' 

    # CORS
    cors_origins: str = '["http://localhost:5173", "http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from JSON string to list."""
        if isinstance(self.cors_origins, str):
            try:
                return json.loads(self.cors_origins)
            except json.JSONDecodeError:
                return ['http://localhost:5173', 'http://localhost:3000']
        return self.cors_origins

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore',  # Ignore extra fields like DATABASE_URL when it's a computed field
        env_ignore_empty=True  # Ignore empty environment variables
    )


# Global settings instance
settings = Settings()  # type: ignore
