"""File storage service - R2 only."""

import logging

from app.services.r2_storage_service import R2StorageService

logger = logging.getLogger(__name__)

# Global storage service instance (R2 only)
storage_service = R2StorageService()
logger.info('Storage service initialized with R2')
