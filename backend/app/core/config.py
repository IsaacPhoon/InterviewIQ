"""Application configuration using Pydantic settings."""

import json
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = 'InterviewIQ'
    app_version: str = '1.0.0'
    debug: bool = False

    # Database
    database_url: str

    # Security
    jwt_secret: str
    jwt_algorithm: str = 'HS256'
    jwt_expiration_hours: int = 2

    # AI Services
    claude_api_key: str
    claude_model: str = 'claude-sonnet-4-5-20250929'

    # Storage
    max_audio_size_mb: int = 50
    max_audio_duration_minutes: int = 5

    # Cloudflare R2 Storage (Required)
    r2_endpoint_url: str
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket_name: str
    r2_public_url: Optional[str] = None  # Optional: Custom domain for public access

    # Whisper
    whisper_model: str = 'base.en'
    whisper_device: str = 'cpu'  # or "cuda" for GPU

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
        env_file='.env', env_file_encoding='utf-8', case_sensitive=False
    )


# Global settings instance
settings = Settings()
