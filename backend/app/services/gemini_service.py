"""
Gemini API Service for Prerequisite Parsing
"""

from google import genai
from typing import List
import json
import re
import logging
import os
from app.config.settings import settings

logger = logging.getLogger(__name__)


class GeminiPrerequisiteParser:
    """Parse prerequisite text using Gemini AI"""

    def __init__(self):
        if settings.GEMINI_API_KEY:
            os.environ['GOOGLE_API_KEY'] = settings.GEMINI_API_KEY
            self.client = genai.Client()
        else:
            self.client = None
            logger.warning("Gemini API key not configured - using regex fallback")

    def parse_prerequisites(self, prereq_text: str) -> List[str]:
        """
        Extract course codes from prerequisite text

        Args:
            prereq_text: Raw prerequisite string

        Returns:
            List of course codes (e.g., ['CS 2110', 'MATH 1920'])
        """
        if not prereq_text or prereq_text.strip() == "":
            return []

        # Try Gemini first
        if self.client:
            try:
                return self._parse_with_gemini(prereq_text)
            except Exception as e:
                logger.warning(f"Gemini parsing failed: {e}, falling back to regex")

        # Fallback to regex
        return self._parse_with_regex(prereq_text)

    def _parse_with_gemini(self, prereq_text: str) -> List[str]:
        """Parse using Gemini AI"""
        prompt = f"""Extract all course codes from this prerequisite text.
Return ONLY a JSON array of course code strings. Nothing else.

Example input: "CS 2110 and (MATH 1920 or MATH 1910)"
Example output: ["CS 2110", "MATH 1920", "MATH 1910"]

Input: {prereq_text}
Output:"""

        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        text = response.text.strip()

        # Extract JSON from response
        json_match = re.search(r'\[.*\]', text, re.DOTALL)
        if json_match:
            courses = json.loads(json_match.group())
            return [c.strip() for c in courses if isinstance(c, str)]

        return []

    def _parse_with_regex(self, prereq_text: str) -> List[str]:
        """Fallback regex parsing"""
        # Pattern: Subject (2-4 letters) + space + number (4 digits)
        pattern = r'\b([A-Z]{2,4})\s+(\d{4})\b'
        matches = re.findall(pattern, prereq_text)
        return [f"{subject} {number}" for subject, number in matches]
