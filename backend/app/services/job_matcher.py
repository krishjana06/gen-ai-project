import json
import re
from typing import Dict, Any, List
import openai
from ..config.settings import settings

class JobMatcherService:
    """Service for matching job descriptions with Cornell CS/Math courses."""

    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        # Sample Cornell CS/Math courses database (subset)
        self.courses_db = {
            "CS 1110": {
                "title": "Introduction to Computing Using Python",
                "skills": ["Python", "Programming Fundamentals", "Problem Solving"]
            },
            "CS 2110": {
                "title": "Object-Oriented Programming and Data Structures",
                "skills": ["Java", "OOP", "Data Structures", "Algorithms"]
            },
            "CS 2800": {
                "title": "Discrete Structures",
                "skills": ["Discrete Math", "Logic", "Proofs", "Graph Theory"]
            },
            "CS 3110": {
                "title": "Data Structures and Functional Programming",
                "skills": ["OCaml", "Functional Programming", "Advanced Data Structures"]
            },
            "CS 3410": {
                "title": "Computer System Organization and Programming",
                "skills": ["Computer Architecture", "Assembly", "Systems Programming"]
            },
            "CS 4410": {
                "title": "Operating Systems",
                "skills": ["OS Design", "Concurrency", "File Systems", "C Programming"]
            },
            "CS 4420": {
                "title": "Computer Networks",
                "skills": ["Networking", "TCP/IP", "Distributed Systems"]
            },
            "CS 4670": {
                "title": "Introduction to Computer Vision",
                "skills": ["Computer Vision", "Image Processing", "Machine Learning"]
            },
            "CS 4740": {
                "title": "Natural Language Processing",
                "skills": ["NLP", "Machine Learning", "Text Processing", "Python"]
            },
            "CS 4780": {
                "title": "Machine Learning",
                "skills": ["ML Algorithms", "Neural Networks", "Statistics", "Python"]
            },
            "CS 4820": {
                "title": "Introduction to Algorithms",
                "skills": ["Algorithm Design", "Complexity Analysis", "Graph Algorithms"]
            },
            "CS 5220": {
                "title": "Applications of Parallel Computers",
                "skills": ["Parallel Computing", "HPC", "Performance Optimization"]
            },
            "CS 5300": {
                "title": "The Architecture of Large-Scale Information Systems",
                "skills": ["Distributed Systems", "Scalability", "System Design"]
            },
            "CS 5412": {
                "title": "Cloud Computing",
                "skills": ["Cloud Architecture", "AWS", "Distributed Systems"]
            },
            "CS 5430": {
                "title": "System Security",
                "skills": ["Security", "Cryptography", "Network Security"]
            },
            "CS 5780": {
                "title": "Machine Learning Engineering",
                "skills": ["ML Engineering", "MLOps", "Production ML Systems"]
            },
            "MATH 2210": {
                "title": "Linear Algebra",
                "skills": ["Linear Algebra", "Matrices", "Vector Spaces"]
            },
            "MATH 2930": {
                "title": "Differential Equations",
                "skills": ["Differential Equations", "Calculus", "Mathematical Modeling"]
            },
            "MATH 4710": {
                "title": "Basic Probability",
                "skills": ["Probability Theory", "Statistics", "Stochastic Processes"]
            }
        }

    async def match_job_to_courses(self, job_description: str) -> Dict[str, Any]:
        """
        Match a job description to relevant courses using AI.

        Args:
            job_description: Full text of the job description

        Returns:
            Dictionary with matched courses, paths, and skill gaps
        """

        # Create course database string for prompt
        courses_info = "\n".join([
            f"{code}: {data['title']} - Skills: {', '.join(data['skills'])}"
            for code, data in self.courses_db.items()
        ])

        system_prompt = f"""You are a course recommendation expert for Cornell CS and Math students.

Available courses:
{courses_info}

Given a job description, analyze the required skills and recommend relevant courses.

Return a JSON response with this exact structure:
{{
  "matched_courses": [
    {{
      "code": "CS 4780",
      "title": "Machine Learning",
      "relevance_score": 0.95,
      "reason": "Direct match for machine learning requirements"
    }}
  ],
  "recommended_paths": [
    {{
      "path_name": "Machine Learning Engineer Path",
      "courses": ["CS 2110", "CS 4780", "MATH 2210"],
      "description": "Foundation for ML engineering roles"
    }}
  ],
  "skill_gaps": ["Docker", "Kubernetes"],
  "overall_match_score": 85
}}

Rules:
- relevance_score is 0.0 to 1.0
- overall_match_score is 0 to 100
- List only courses from the provided database
- Recommend 3-8 most relevant courses
- Identify 1-3 learning paths
- List skills mentioned in job but not covered by courses
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze this job description and recommend courses:\n\n{job_description[:3000]}"}
                ],
                temperature=0.3,
                max_tokens=2000
            )

            result_text = response.choices[0].message.content.strip()

            # Clean up markdown code blocks if present
            if result_text.startswith("```"):
                result_text = re.sub(r'^```(?:json)?\n', '', result_text)
                result_text = re.sub(r'\n```$', '', result_text)

            # Parse JSON
            result = json.loads(result_text)

            # Add course titles from database
            for course in result.get("matched_courses", []):
                if course["code"] in self.courses_db:
                    course["title"] = self.courses_db[course["code"]]["title"]

            return result

        except Exception as e:
            # Return fallback structure on error
            return {
                "matched_courses": [
                    {
                        "code": "CS 2110",
                        "title": "Object-Oriented Programming and Data Structures",
                        "relevance_score": 0.7,
                        "reason": "Fundamental programming course"
                    }
                ],
                "recommended_paths": [
                    {
                        "path_name": "General Software Engineering",
                        "courses": ["CS 2110", "CS 3110", "CS 4820"],
                        "description": "Core CS foundation"
                    }
                ],
                "skill_gaps": [],
                "overall_match_score": 50
            }
