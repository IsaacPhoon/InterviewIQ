"""Claude API service for question generation and response evaluation."""
import logging
from typing import List, Dict, Any
from anthropic import Anthropic
import json

from app.core.config import settings

logger = logging.getLogger(__name__)


class ClaudeService:
    """Service for interacting with Claude API."""

    def __init__(self):
        """Initialize Claude client."""
        self.client = Anthropic(api_key=settings.claude_api_key)
        self.model = settings.claude_model

    def generate_questions(
        self,
        job_description_text: str,
        company_name: str,
        job_title: str
    ) -> List[str]:
        """
        Generate 5 behavioral interview questions based on job description.

        Args:
            job_description_text: Extracted text from job description PDF
            company_name: Name of the company
            job_title: Title of the job position

        Returns:
            List of 5 question strings

        Raises:
            Exception: If Claude API call fails
        """
        prompt = f"""You are an expert interview coach. Based on the following job description, generate exactly 5 behavioral interview questions that are tailored to this specific role.

Company: {company_name}
Job Title: {job_title}

Job Description:
{job_description_text}

Generate 5 behavioral interview questions that:
1. Are specific to this role and company
2. Follow the STAR method (Situation, Task, Action, Result)
3. Test relevant competencies for this position
4. Are clear and professionally worded
5. Cover different aspects of the role

IMPORTANT: Return ONLY a valid JSON array of 5 question strings. Do not include any markdown formatting, code blocks, or additional text. Just the raw JSON array.

Example of correct format:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Extract text from response
            questions_text = response.content[0].text.strip()
            
            # Remove markdown code blocks if present
            if questions_text.startswith("```"):
                # Remove markdown code block formatting
                questions_text = questions_text.replace("```json", "").replace("```", "").strip()
            
            logger.info(f"Raw Claude response: {questions_text[:200]}")

            # Parse JSON array
            questions = json.loads(questions_text)

            if not isinstance(questions, list):
                logger.error(f"Response is not a list: {type(questions)}")
                raise ValueError("Claude did not return a list of questions")
            
            if len(questions) != 5:
                logger.warning(f"Expected 5 questions but got {len(questions)}, adjusting...")
                # Take first 5 or pad with generic questions if needed
                if len(questions) > 5:
                    questions = questions[:5]
                else:
                    while len(questions) < 5:
                        questions.append(f"Tell me about a time when you demonstrated skills relevant to this {job_title} role?")

            logger.info(f"Generated {len(questions)} questions for {company_name} - {job_title}")
            return questions

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response as JSON: {e}")
            logger.error(f"Raw response text: {questions_text}")
            raise Exception("Failed to parse questions from Claude response")
        except Exception as e:
            logger.error(f"Claude API error during question generation: {e}")
            raise

    def evaluate_response(
        self,
        job_description_text: str,
        question_text: str,
        transcript: str
    ) -> Dict[str, Any]:
        """
        Evaluate user's response using Claude API with structured outputs.

        Args:
            job_description_text: Original job description text
            question_text: The interview question
            transcript: User's transcribed response

        Returns:
            Dictionary containing scores and feedback

        Raises:
            Exception: If Claude API call fails
        """
        # Define JSON schema for structured output
        schema = {
            "type": "object",
            "properties": {
                "scores": {
                    "type": "object",
                    "properties": {
                        "confidence": {"type": "integer", "minimum": 1, "maximum": 10},
                        "clarity_structure": {"type": "integer", "minimum": 1, "maximum": 10},
                        "technical_depth": {"type": "integer", "minimum": 1, "maximum": 10},
                        "communication_skills": {"type": "integer", "minimum": 1, "maximum": 10},
                        "relevance": {"type": "integer", "minimum": 1, "maximum": 10}
                    },
                    "required": ["confidence", "clarity_structure", "technical_depth", "communication_skills", "relevance"]
                },
                "feedback": {
                    "type": "object",
                    "properties": {
                        "confidence": {"type": "string"},
                        "clarity_structure": {"type": "string"},
                        "technical_depth": {"type": "string"},
                        "communication_skills": {"type": "string"},
                        "relevance": {"type": "string"}
                    },
                    "required": ["confidence", "clarity_structure", "technical_depth", "communication_skills", "relevance"]
                },
                "overall_comment": {"type": "string"}
            },
            "required": ["scores", "feedback", "overall_comment"]
        }

        prompt = f"""You are an expert interview coach evaluating a candidate's response to a behavioral interview question.

Job Description:
{job_description_text}

Interview Question:
{question_text}

Candidate's Response:
{transcript}

Evaluate the response on the following criteria (score 1-10 for each):

1. **Confidence**: How confident and self-assured does the candidate sound?
2. **Clarity/Structure**: How well-structured and clear is the response? Does it follow STAR method?
3. **Technical Depth**: How well does the response demonstrate relevant technical/domain knowledge?
4. **Communication Skills**: How effectively does the candidate communicate their ideas?
5. **Relevance/Alignment**: How well does the response align with the job requirements?

For each category, provide:
- A score from 1 to 10
- Concise, actionable feedback (2-3 sentences)

Also provide an overall comment summarizing the response quality and key areas for improvement.

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{{
  "scores": {{
    "confidence": <number 1-10>,
    "clarity_structure": <number 1-10>,
    "technical_depth": <number 1-10>,
    "communication_skills": <number 1-10>,
    "relevance": <number 1-10>
  }},
  "feedback": {{
    "confidence": "<feedback text>",
    "clarity_structure": "<feedback text>",
    "technical_depth": "<feedback text>",
    "communication_skills": "<feedback text>",
    "relevance": "<feedback text>"
  }},
  "overall_comment": "<overall comment text>"
}}"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=3000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Extract and parse the JSON response
            evaluation_text = response.content[0].text.strip()
            
            # Remove markdown code blocks if present
            if evaluation_text.startswith("```"):
                evaluation_text = evaluation_text.replace("```json", "").replace("```", "").strip()
            
            evaluation = json.loads(evaluation_text)

            # Validate the structure
            if "scores" not in evaluation or "feedback" not in evaluation:
                logger.error(f"Invalid evaluation structure: {evaluation}")
                raise ValueError("Claude did not return proper evaluation structure")

            logger.info("Successfully evaluated response with Claude")
            return evaluation

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude evaluation as JSON: {e}")
            logger.error(f"Raw response: {evaluation_text}")
            raise Exception("Failed to parse evaluation from Claude response")
        except Exception as e:
            logger.error(f"Claude API error during response evaluation: {e}")
            raise


# Global service instance
claude_service = ClaudeService()
