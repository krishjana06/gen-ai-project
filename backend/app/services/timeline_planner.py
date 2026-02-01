"""
Timeline Planner Service - Generates 3 career path timelines using Gemini AI
"""

from google import genai
from typing import List, Dict, Any
import json
import os
import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)


class TimelinePlanner:
    """Generate personalized course timelines for different career paths"""

    def __init__(self):
        if settings.GEMINI_API_KEY:
            os.environ['GOOGLE_API_KEY'] = settings.GEMINI_API_KEY
            self.client = genai.Client()
        else:
            self.client = None
            logger.error("Gemini API key not configured")
            raise ValueError("Gemini API key required for timeline planning")

    def generate_timelines(
        self,
        career_goal: str,
        completed_courses: List[str],
        current_semester: str = "Sophomore Fall",
        available_courses: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate 3 distinct timeline paths based on user's career goal

        Args:
            career_goal: User's career objective (e.g., "work at NVIDIA on self-driving cars")
            completed_courses: List of course codes already taken (e.g., ["CS 2110", "MATH 1920"])
            current_semester: Current academic standing
            available_courses: List of all available courses with metadata

        Returns:
            Dict with 3 timeline paths: theorist, engineer, balanced
        """
        prompt = self._build_timeline_prompt(
            career_goal,
            completed_courses,
            current_semester,
            available_courses
        )

        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )

            # Parse the JSON response
            result = self._parse_timeline_response(response.text)
            return result

        except Exception as e:
            logger.error(f"Timeline generation failed: {e}")
            raise

    def _build_timeline_prompt(
        self,
        career_goal: str,
        completed_courses: List[str],
        current_semester: str,
        available_courses: List[Dict[str, Any]]
    ) -> str:
        """Build the prompt for Gemini to generate timelines"""

        # Simplified prompt for faster response
        prompt = f"""Cornell CS advisor: Create 3 course paths for "{career_goal}". Completed: {', '.join(completed_courses) if completed_courses else 'None'}.

Paths (4 semesters each, 3-4 courses/semester):
1. "The Theorist" - Theory/Math → PhD
2. "The Engineer" - Systems/Practice → Industry
3. "The Balanced" - Mix → Versatile

Return ONLY this JSON:
{{
  "analysis": {{
    "career_field": "field name",
    "key_skills_needed": ["skill1", "skill2", "skill3"],
    "current_level": "brief assessment"
  }},
  "paths": {{
    "theorist": {{
      "title": "The Theorist",
      "description": "1 sentence",
      "target_career": "PhD/Research",
      "semesters": [
        {{
          "name": "Sophomore Spring",
          "courses": [{{"code": "CS 4820", "title": "Algorithms", "reason": "short reason"}}]
        }},
        {{"name": "Junior Fall", "courses": [...]}},
        {{"name": "Junior Spring", "courses": [...]}},
        {{"name": "Senior Fall", "courses": [...]}}
      ]
    }},
    "engineer": {{
      "title": "The Engineer",
      "description": "1 sentence",
      "target_career": "Software Engineer",
      "semesters": [same 4 semesters]
    }},
    "balanced": {{
      "title": "The Balanced",
      "description": "1 sentence",
      "target_career": "Versatile roles",
      "semesters": [same 4 semesters]
    }}
  }}
}}

Use real Cornell CS/MATH courses. NO markdown, just JSON."""

        return prompt

    def _parse_timeline_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Gemini's JSON response into structured timeline data"""

        # Remove markdown code blocks if present
        text = response_text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        text = text.strip()

        try:
            result = json.loads(text)

            # Validate structure
            if 'paths' not in result:
                raise ValueError("Response missing 'paths' field")

            required_paths = ['theorist', 'engineer', 'balanced']
            for path_name in required_paths:
                if path_name not in result['paths']:
                    raise ValueError(f"Missing path: {path_name}")

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse timeline JSON: {e}\nResponse: {text}")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")
