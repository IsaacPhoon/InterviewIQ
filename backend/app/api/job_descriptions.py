"""Job description API endpoints."""

import logging
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.job_description import JobDescription, JobDescriptionStatus
from app.models.question import Question
from app.models.response import Response
from app.models.user import User
from app.schemas.job_description import (
    JobDescriptionCreate,
    JobDescriptionListResponse,
    JobDescriptionResponse,
)
from app.schemas.question import QuestionResponse
from app.services.claude_service import claude_service
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix='/api/job-descriptions', tags=['Job Descriptions'])
logger = logging.getLogger(__name__)


@router.post(
    '', response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED
)
async def create_job_description(
    job_data: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a job description with text input and generate interview questions.

    Args:
        job_data: Job description data including text
        current_user: Authenticated user
        db: Database session

    Returns:
        Created job description with status

    Raises:
        HTTPException: If processing fails
    """
    try:
        # Create job description record with text
        job_description = JobDescription(
            user_id=current_user.id,
            company_name=job_data.company_name,
            job_title=job_data.job_title,
            description_text=job_data.description_text,
            status=JobDescriptionStatus.PENDING,
        )

        db.add(job_description)
        db.commit()
        db.refresh(job_description)

        # Generate questions using Claude
        try:
            questions_list = claude_service.generate_questions(
                job_data.description_text, job_data.company_name, job_data.job_title
            )

            # Save questions to database
            for question_text in questions_list:
                question = Question(
                    job_description_id=job_description.id,
                    user_id=current_user.id,
                    question_text=question_text,
                )
                db.add(question)

            # Update status to success
            job_description.status = JobDescriptionStatus.QUESTIONS_GENERATED  # type: ignore
            db.commit()
            db.refresh(job_description)

            logger.info(
                f'Successfully generated {len(questions_list)} questions for job description {job_description.id}'
            )

        except Exception as e:
            # Update status to error
            job_description.status = JobDescriptionStatus.ERROR  # type: ignore
            job_description.error_message = str(e)  # type: ignore
            db.commit()
            db.refresh(job_description)

            logger.error(f'Failed to generate questions: {e}')

        return job_description

    except Exception as e:
        logger.error(f'Error creating job description: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to process job description',
        )


@router.get('', response_model=List[JobDescriptionListResponse])
def list_job_descriptions(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    List all job descriptions for the authenticated user with progress info.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        List of user's job descriptions with progress tracking
    """
    job_descriptions = (
        db.query(JobDescription)
        .filter(JobDescription.user_id == current_user.id)
        .order_by(JobDescription.created_at.desc())
        .all()
    )

    # Build response with progress information
    result = []
    for jd in job_descriptions:
        # Count total questions for this job description
        total_questions = (
            db.query(Question)
            .filter(Question.job_description_id == jd.id)
            .count()
        )

        # Count questions that have at least one response
        answered_questions = (
            db.query(Question.id)
            .filter(Question.job_description_id == jd.id)
            .join(Response, Response.question_id == Question.id)
            .distinct()
            .count()
        )

        result.append(
            JobDescriptionListResponse(
                id=jd.id,
                company_name=jd.company_name,
                job_title=jd.job_title,
                status=jd.status.value,
                created_at=jd.created_at,
                total_questions=total_questions,
                answered_questions=answered_questions,
            )
        )

    return result


@router.get('/{job_description_id}/questions', response_model=List[QuestionResponse])
def get_questions(
    job_description_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all questions for a specific job description with response tracking.

    Args:
        job_description_id: ID of the job description
        current_user: Authenticated user
        db: Database session

    Returns:
        List of questions with attempt counts

    Raises:
        HTTPException: If job description not found or unauthorized
    """
    # Verify job description belongs to user
    job_description = (
        db.query(JobDescription)
        .filter(
            JobDescription.id == job_description_id,
            JobDescription.user_id == current_user.id,
        )
        .first()
    )

    if not job_description:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='Job description not found'
        )

    # Get questions with response counts
    questions = (
        db.query(Question)
        .filter(Question.job_description_id == job_description_id)
        .all()
    )

    # Build response with attempt counts
    result = []
    for question in questions:
        # Count responses for this question
        attempts_count = (
            db.query(Response)
            .filter(Response.question_id == question.id)
            .count()
        )

        result.append(
            QuestionResponse(
                id=question.id,
                job_description_id=question.job_description_id,
                question_text=question.question_text,
                created_at=question.created_at,
                attempts_count=attempts_count,
            )
        )

    return result
