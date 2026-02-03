import json
import re
from typing import Dict, Any, List, Optional
import openai
from ..config.settings import get_settings

settings = get_settings()

class MaterialsService:
    """Service for generating and curating study materials for courses."""

    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        # Course database with titles
        self.courses_db = {
            "CS1110": "Introduction to Computing Using Python",
            "CS2110": "Object-Oriented Programming and Data Structures",
            "CS2800": "Discrete Structures",
            "CS3110": "Data Structures and Functional Programming",
            "CS3410": "Computer System Organization and Programming",
            "CS4410": "Operating Systems",
            "CS4420": "Computer Networks",
            "CS4670": "Introduction to Computer Vision",
            "CS4740": "Natural Language Processing",
            "CS4780": "Machine Learning",
            "CS4820": "Introduction to Algorithms",
            "CS5220": "Applications of Parallel Computers",
            "CS5300": "The Architecture of Large-Scale Information Systems",
            "CS5412": "Cloud Computing",
            "CS5430": "System Security",
            "CS5780": "Machine Learning Engineering",
            "MATH2210": "Linear Algebra",
            "MATH2930": "Differential Equations",
            "MATH4710": "Basic Probability",
        }

    async def get_materials(self, course_code: str) -> Dict[str, Any]:
        """
        Get curated study materials for a course using AI.

        Args:
            course_code: Normalized course code (e.g., "CS2110")

        Returns:
            Dictionary with course info and study materials
        """
        # Check if course exists
        if course_code not in self.courses_db:
            return None

        course_title = self.courses_db[course_code]
        formatted_code = self._format_course_code(course_code)

        # Generate materials using OpenAI
        materials = await self._generate_materials(formatted_code, course_title)

        return {
            "course_code": formatted_code,
            "course_title": course_title,
            "materials": materials
        }

    def _format_course_code(self, code: str) -> str:
        """Format course code as 'CS 2110' from 'CS2110'."""
        match = re.match(r'([A-Z]+)(\d+)', code)
        if match:
            return f"{match.group(1)} {match.group(2)}"
        return code

    async def _generate_materials(self, course_code: str, course_title: str) -> List[Dict[str, Any]]:
        """Use OpenAI to generate relevant study materials."""

        system_prompt = """You are an educational resource curator for Cornell CS and Math courses.

Given a course, recommend high-quality study materials including:
- Video tutorials (YouTube, Coursera, etc.)
- Articles and blog posts
- Practice problems and coding exercises
- Official documentation
- Recommended textbooks

Return a JSON array with this structure:
[
  {
    "title": "Resource title",
    "type": "video|article|practice|documentation|book",
    "url": "https://example.com",
    "description": "Brief description of what this resource covers",
    "difficulty": "beginner|intermediate|advanced",
    "duration": "Optional: e.g., '2 hours', '30 min'"
  }
]

Rules:
- Provide 6-12 diverse, high-quality resources
- Mix different types and difficulty levels
- Use real, accessible URLs when possible
- For generic resources, use placeholder domains
- Prioritize free, publicly accessible materials
- Include both introductory and advanced resources
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Recommend study materials for: {course_code} - {course_title}"}
                ],
                temperature=0.5,
                max_tokens=2000
            )

            result_text = response.choices[0].message.content.strip()

            # Clean up markdown code blocks
            if result_text.startswith("```"):
                result_text = re.sub(r'^```(?:json)?\n', '', result_text)
                result_text = re.sub(r'\n```$', '', result_text)

            # Parse JSON
            materials = json.loads(result_text)

            return materials

        except Exception as e:
            # Return fallback materials on error
            return self._get_fallback_materials(course_code, course_title)

    def _get_fallback_materials(self, course_code: str, course_title: str) -> List[Dict[str, Any]]:
        """Provide fallback study materials when AI generation fails."""

        fallback = [
            {
                "title": f"{course_title} - Course Website",
                "type": "documentation",
                "url": "https://classes.cornell.edu",
                "description": "Official course website with lectures, assignments, and resources",
                "difficulty": "intermediate"
            },
            {
                "title": "Cornell CS Department Resources",
                "type": "documentation",
                "url": "https://www.cs.cornell.edu",
                "description": "General CS department resources and study guides",
                "difficulty": "beginner"
            },
            {
                "title": f"Introduction to {course_title}",
                "type": "video",
                "url": "https://www.youtube.com",
                "description": "Video tutorials covering course fundamentals",
                "difficulty": "beginner",
                "duration": "Variable"
            },
            {
                "title": "Practice Problems",
                "type": "practice",
                "url": "https://leetcode.com",
                "description": "Coding exercises to reinforce course concepts",
                "difficulty": "intermediate"
            },
            {
                "title": "Advanced Topics and Research Papers",
                "type": "article",
                "url": "https://arxiv.org",
                "description": "Research papers and advanced materials for deeper understanding",
                "difficulty": "advanced"
            }
        ]

        return fallback
