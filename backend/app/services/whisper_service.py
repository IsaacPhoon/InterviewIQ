"""Faster-whisper service for audio transcription."""

import logging
from pathlib import Path

from app.core.config import settings
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)


class WhisperService:
    """Service for audio transcription using faster-whisper."""

    def __init__(self):
        """Initialize Whisper model."""
        logger.info(
            f'Initializing Whisper model: {settings.whisper_model} on {settings.whisper_device}'
        )
        self.model = WhisperModel(
            settings.whisper_model,
            device=settings.whisper_device,
            compute_type='int8' if settings.whisper_device == 'cpu' else 'float16',
        )

    def transcribe(self, audio_path: str) -> str:
        """
        Transcribe audio file to text.

        Args:
            audio_path: Path to audio file

        Returns:
            Transcribed text as string

        Raises:
            Exception: If transcription fails
        """
        try:
            # Verify file exists
            audio_file = Path(audio_path)
            if not audio_file.exists():
                raise FileNotFoundError(f'Audio file not found: {audio_path}')

            logger.info(f'Transcribing audio file: {audio_path}')

            # Transcribe with faster-whisper
            segments, info = self.model.transcribe(
                audio_path,
                language='en',
                beam_size=5,
                vad_filter=True,  # Voice activity detection
                vad_parameters=dict(min_silence_duration_ms=500),
            )

            # Combine all segments into full transcript
            transcript_parts = []
            for segment in segments:
                transcript_parts.append(segment.text)

            transcript = ' '.join(transcript_parts).strip()

            logger.info(
                f'Transcription completed. Length: {len(transcript)} characters'
            )

            if not transcript:
                logger.warning('Transcription resulted in empty text')
                return 'No speech detected in audio.'

            return transcript

        except Exception as e:
            logger.error(f'Transcription error: {e}')
            raise Exception(f'Failed to transcribe audio: {str(e)}')


# Global service instance
whisper_service = WhisperService()
