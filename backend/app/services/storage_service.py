"""File storage service."""
import logging
import uuid
import aiofiles
from pathlib import Path
from typing import BinaryIO
import pypdf

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageService:
    """Service for file storage operations."""

    def __init__(self):
        """Initialize storage service and ensure upload directory exists."""
        self.storage_root = Path(settings.storage_root)
        self.pdfs_dir = self.storage_root / "pdfs"
        self.audio_dir = self.storage_root / "audio"

        # Create directories if they don't exist
        self.pdfs_dir.mkdir(parents=True, exist_ok=True)
        self.audio_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"Storage initialized at: {self.storage_root}")

    async def save_pdf(self, file: BinaryIO, filename: str) -> tuple[str, str]:
        """
        Save PDF file and extract text.

        Args:
            file: File object to save
            filename: Original filename

        Returns:
            Tuple of (file_path, extracted_text)

        Raises:
            Exception: If file save or text extraction fails
        """
        try:
            # Generate unique filename
            file_ext = Path(filename).suffix
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = self.pdfs_dir / unique_filename

            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)

            logger.info(f"PDF saved to: {file_path}")

            # Extract text from PDF
            extracted_text = self.extract_pdf_text(str(file_path))

            return str(file_path), extracted_text

        except Exception as e:
            logger.error(f"Error saving PDF: {e}")
            raise

    def extract_pdf_text(self, pdf_path: str) -> str:
        """
        Extract text from PDF file.

        Args:
            pdf_path: Path to PDF file

        Returns:
            Extracted text as string
        """
        try:
            reader = pypdf.PdfReader(pdf_path)
            text_parts = []

            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)

            full_text = "\n".join(text_parts).strip()

            logger.info(f"Extracted {len(full_text)} characters from PDF")
            return full_text

        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            raise Exception("Failed to extract text from PDF")

    async def save_audio(self, file: BinaryIO, filename: str) -> str:
        """
        Save audio file.

        Args:
            file: File object to save
            filename: Original filename

        Returns:
            Path to saved file

        Raises:
            Exception: If file save fails
        """
        try:
            # Generate unique filename
            file_ext = Path(filename).suffix or ".webm"
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = self.audio_dir / unique_filename

            # Save file - read synchronously from SpooledTemporaryFile
            async with aiofiles.open(file_path, 'wb') as f:
                # Read content synchronously (not async) from the file object
                content = file.read()
                await f.write(content)

            logger.info(f"Audio saved to: {file_path}")
            return str(file_path)

        except Exception as e:
            logger.error(f"Error saving audio: {e}")
            raise

    def delete_file(self, file_path: str) -> None:
        """
        Delete a file from storage.

        Args:
            file_path: Path to file to delete
        """
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
                logger.info(f"Deleted file: {file_path}")
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")


# Global service instance
storage_service = StorageService()
