"""Response and evaluation API endpoints."""

import logging
import tempfile
from pathlib import Path
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.job_description import JobDescription
from app.models.question import Question
from app.models.response import Response
from app.models.response_score import ResponseScore
from app.models.user import User
from app.schemas.response import (
    FeedbackResponse,
    ResponseListItem,
    ResponseResponse,
    ScoresResponse,
)
from app.services.claude_service import claude_service
from app.services.storage_service import storage_service
from app.services.whisper_service import whisper_service
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

router = APIRouter(prefix='/api/questions', tags=['Responses'])
logger = logging.getLogger(__name__)


@router.post(
    '/{question_id}/responses',
    response_model=ResponseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_response(
    question_id: str,
    audio_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit an audio response to a question, transcribe it, and get evaluation.

    Args:
        question_id: ID of the question being answered
        audio_file: Audio file upload
        current_user: Authenticated user
        db: Database session

    Returns:
        Response with transcript, scores, and feedback

    Raises:
        HTTPException: If question not found or processing fails
    """
    # Verify question belongs to user
    question = (
        db.query(Question)
        .filter(Question.id == question_id, Question.user_id == current_user.id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='Question not found'
        )

    # Get job description for evaluation context
    job_description = (
        db.query(JobDescription)
        .filter(JobDescription.id == question.job_description_id)
        .first()
    )

    # Validate file size (max 50MB)
    content = await audio_file.read()
    await audio_file.seek(0)

    if len(content) > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Audio file size must be less than 50MB',
        )

    try:
        filename = audio_file.filename or 'response.webm'

        # Save uploaded file to temporary location for transcription
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
            temp_file.write(content)
            temp_audio_path = temp_file.name

        try:
            # Transcribe audio from temporary file
            logger.info(f'Transcribing audio for question {question_id}')
            transcript = whisper_service.transcribe(temp_audio_path)

            # Upload to R2 after successful transcription
            # Reset file position to beginning for upload
            audio_file.file.seek(0)
            r2_key = await storage_service.save_audio(audio_file.file, filename)
            logger.info(f'Audio saved to R2: {r2_key}')

        finally:
            # Clean up temporary file
            Path(temp_audio_path).unlink(missing_ok=True)

        # Create response record with R2 key
        response = Response(
            question_id=question.id,
            user_id=current_user.id,
            audio_path=r2_key,  # Store R2 key for later retrieval
            transcript=transcript,
        )

        db.add(response)
        db.commit()
        db.refresh(response)

        # Evaluate response using Claude
        logger.info(f'Evaluating response {response.id}')
        evaluation = claude_service.evaluate_response(
            job_description.extracted_text, question.question_text, transcript
        )

        # Create response score record
        scores = evaluation['scores']
        feedback = evaluation['feedback']

        response_score = ResponseScore(
            response_id=response.id,
            scores_json=evaluation,
            score_confidence=scores.get('confidence'),
            score_clarity_structure=scores.get('clarity_structure'),
            score_technical_depth=scores.get('technical_depth'),
            score_communication_skills=scores.get('communication_skills'),
            score_relevance=scores.get('relevance'),
        )

        db.add(response_score)
        db.commit()
        db.refresh(response_score)

        logger.info(f'Successfully processed response {response.id}')

        # Return formatted response
        return {
            'response_id': response.id,
            'transcript': transcript,
            'scores': ScoresResponse(**scores),
            'feedback': FeedbackResponse(**feedback),
            'overall_comment': evaluation.get('overall_comment'),
            'created_at': response.created_at,
        }

    except Exception as e:
        logger.error(f'Error processing response: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Failed to process response: {str(e)}',
        )


@router.get('/{question_id}/responses', response_model=List[ResponseListItem])
def list_responses(
    question_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all responses for a specific question.

    Args:
        question_id: ID of the question
        current_user: Authenticated user
        db: Database session

    Returns:
        List of responses with scores

    Raises:
        HTTPException: If question not found or unauthorized
    """
    # Verify question belongs to user
    question = (
        db.query(Question)
        .filter(Question.id == question_id, Question.user_id == current_user.id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='Question not found'
        )

    # Get all responses with scores
    responses = (
        db.query(Response, ResponseScore)
        .join(ResponseScore, Response.id == ResponseScore.response_id)
        .filter(Response.question_id == question_id)
        .order_by(Response.created_at.desc())
        .all()
    )

    # Format response
    result = []
    for response, score in responses:
        scores_data = score.scores_json.get('scores', {})
        result.append(
            {
                'response_id': response.id,
                'created_at': response.created_at,
                'scores': ScoresResponse(**scores_data),
            }
        )

    return result
