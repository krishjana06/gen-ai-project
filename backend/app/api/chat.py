"""
Chat API endpoint - RAG-based course advisor with RMP and Reddit context
"""

import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI
from app.config.settings import settings
from app.services.rmp_service import format_course_context
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize OpenAI client
if settings.OPENAI_API_KEY:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
else:
    client = None
    logger.warning("OpenAI API key not configured - chat will return placeholder responses")

# Regex to extract course codes like "CS 2110" or "MATH 1920"
COURSE_CODE_PATTERN = re.compile(r'\b(CS|MATH)\s+(\d{4})\b', re.IGNORECASE)


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    response: str


def extract_course_codes(text: str) -> List[str]:
    """
    Extract course codes from text.

    Args:
        text: Input text to search

    Returns:
        List of unique course codes (e.g., ["CS 2110", "MATH 1920"])
    """
    matches = COURSE_CODE_PATTERN.findall(text)
    # Normalize: uppercase subject + number
    codes = list(dict.fromkeys(
        f"{subject.upper()} {number}" for subject, number in matches
    ))
    return codes


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the course advisor AI.
    Enriches responses with RateMyProfessor and Reddit review data
    when courses are mentioned.

    Args:
        request: ChatRequest with message and optional history

    Returns:
        ChatResponse with AI-generated advice
    """
    if not client:
        return ChatResponse(
            response="Chat functionality requires an OpenAI API key. Please configure OPENAI_API_KEY in your .env file."
        )

    try:
        # Extract course codes from the user's message and recent history
        all_text = request.message
        for msg in (request.history or [])[-3:]:
            all_text += " " + msg.get('content', '')

        course_codes = extract_course_codes(all_text)

        # Build course context from RMP and Reddit data
        course_context = format_course_context(course_codes)

        # Build the prompt with context
        if course_context:
            prompt = f"""You are a helpful Cornell course advisor assistant.
Help students with questions about CS and Math courses.

Below is real review data for courses mentioned in the conversation.
Use this data to provide informed, specific advice. Cite the ratings naturally.
If RateMyProfessor data is available for a course, mention the professor's rating.
If Reddit review data is available, mention the difficulty and enjoyment scores.
If no review data is available for a course, do not fabricate reviews — just give general advice.

=== COURSE REVIEW DATA ===
{course_context}
=== END COURSE DATA ===

Student question: {request.message}

Provide a helpful, concise response that references the real review data above when relevant."""
        else:
            prompt = f"""You are a helpful Cornell course advisor assistant.
Help students with questions about CS and Math courses.

Student question: {request.message}

Provide a helpful, concise response."""

        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {"role": "system", "content": "You are a helpful Cornell course advisor assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return ChatResponse(response=response.choices[0].message.content)

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
