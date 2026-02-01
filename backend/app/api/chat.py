"""
Chat API endpoint - RAG-based course advisor
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from app.config.settings import settings
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize Gemini client
if settings.GEMINI_API_KEY:
    os.environ['GOOGLE_API_KEY'] = settings.GEMINI_API_KEY
    client = genai.Client()
else:
    client = None
    logger.warning("Gemini API key not configured - chat will return placeholder responses")


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    response: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the course advisor AI

    Args:
        request: ChatRequest with message and optional history

    Returns:
        ChatResponse with AI-generated advice
    """
    if not client:
        return ChatResponse(
            response="Chat functionality requires a Gemini API key. Please configure GEMINI_API_KEY in your .env file."
        )

    try:
        # Simple prompt for now (will enhance with graph RAG later)
        prompt = f"""You are a helpful Cornell course advisor assistant.
Help students with questions about CS and Math courses.

Student question: {request.message}

Provide a helpful, concise response."""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return ChatResponse(response=response.text)

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
