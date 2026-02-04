"""
Timeline Planner Service - Generates 3 career path timelines using OpenAI
"""

from openai import OpenAI
from typing import List, Dict, Any
import json
import os
import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)


class TimelinePlanner:
    """Generate personalized course timelines for different career paths"""

    def __init__(self):
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.client = None
            logger.error("OpenAI API key not configured")
            raise ValueError("OpenAI API key required for timeline planning")

    def generate_timelines(
        self,
        career_goal: str,
        completed_courses: List[str],
        current_semester: str = "Sophomore Fall",
        available_courses: List[Dict[str, Any]] = None,
        prerequisites: Dict[str, List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate 3 distinct timeline paths based on user's career goal

        Args:
            career_goal: User's career objective (e.g., "work at NVIDIA on self-driving cars")
            completed_courses: List of course codes already taken (e.g., ["CS 2110", "MATH 1920"])
            current_semester: Current academic standing
            available_courses: List of all available courses with metadata
            prerequisites: Dict mapping course code to list of prerequisite course codes

        Returns:
            Dict with 3 timeline paths: theorist, engineer, balanced
        """
        prompt = self._build_timeline_prompt(
            career_goal,
            completed_courses,
            current_semester,
            available_courses,
            prerequisites
        )

        try:
            response = self.client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[
                    {"role": "system", "content": "You are a Cornell CS course advisor. Return ONLY valid JSON, no markdown."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            # Parse the JSON response
            result = self._parse_timeline_response(response.choices[0].message.content)
            return result

        except Exception as e:
            logger.error(f"Timeline generation failed: {e}")
            raise

    def _build_timeline_prompt(
        self,
        career_goal: str,
        completed_courses: List[str],
        current_semester: str,
        available_courses: List[Dict[str, Any]],
        prerequisites: Dict[str, List[str]] = None
    ) -> str:
        """Build the prompt for OpenAI to generate timelines"""

        # Extract valid course codes from available courses
        valid_course_codes = []
        if available_courses:
            valid_course_codes = [c.get('id', '') for c in available_courses if c.get('id')]

        cs_courses = sorted([c for c in valid_course_codes if c.startswith('CS')])
        math_courses = sorted([c for c in valid_course_codes if c.startswith('MATH')])
        valid_codes_str = ', '.join(cs_courses[:40] + math_courses[:30])

        # Build prerequisite chains for key courses
        prereq_section = ""
        if prerequisites:
            # Key prerequisite chains to highlight
            key_chains = [
                ["CS 1110", "CS 2110", "CS 3110", "CS 4820"],
                ["CS 1110", "CS 2110", "CS 3110", "CS 4110", "CS 4411"],
                ["CS 1110", "CS 2110", "CS 3410", "CS 4210"],
                ["CS 1110", "CS 2110", "CS 3700"],
                ["MATH 1110", "MATH 1120", "MATH 1910", "MATH 1920", "MATH 2210", "MATH 2940"],
                ["MATH 1920", "MATH 2210", "MATH 3110", "MATH 4130"],
            ]
            chains_str = "\n".join(["  " + " → ".join(chain) for chain in key_chains])

            # Build per-course prereqs for courses with multiple prereqs
            multi_prereqs = {k: v for k, v in prerequisites.items() if len(v) >= 2}
            multi_str = "\n".join([f"  {k} requires: {', '.join(v)}" for k, v in sorted(multi_prereqs.items())])

            prereq_section = f"""
PREREQUISITE CHAINS (earlier courses MUST appear in earlier semesters):
{chains_str}

Courses with multiple prerequisites:
{multi_str}

CRITICAL ORDERING RULES:
- A course can ONLY be taken AFTER all its prerequisites are taken (in a previous semester).
- If the student has already completed a prerequisite, it does not need to appear in the timeline.
- Do NOT place CS 4820 before CS 3110. Do NOT place CS 4110 before CS 3110.
- Do NOT place CS 4411 before CS 4110. Do NOT place CS 4210 before CS 3410.
- Do NOT place MATH 2940 before MATH 2210. Do NOT place MATH 2210 before MATH 1920.
"""

        # Build completed courses context
        completed_str = ', '.join(completed_courses) if completed_courses else 'None'

        prompt = f"""Cornell CS & MATH course advisor: Create 3 course timeline paths for "{career_goal}".
Already completed: {completed_str}.

IMPORTANT: Only use courses from this list: {valid_codes_str}
Do NOT invent course codes. Only use real Cornell courses from the list above.
Each path MUST include a mix of both CS and MATH courses (at least 2 MATH courses per path).
{prereq_section}
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
          "courses": [{{"code": "CS 3110", "title": "Functional Programming", "reason": "short reason"}}]
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
      "semesters": [same 4 semesters structure]
    }},
    "balanced": {{
      "title": "The Balanced",
      "description": "1 sentence",
      "target_career": "Versatile roles",
      "semesters": [same 4 semesters structure]
    }}
  }}
}}

NO markdown, just JSON."""

        return prompt

    def _parse_timeline_response(self, response_text: str) -> Dict[str, Any]:
        """Parse OpenAI's JSON response into structured timeline data"""

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
            raise ValueError(f"Invalid JSON response from OpenAI: {e}")
