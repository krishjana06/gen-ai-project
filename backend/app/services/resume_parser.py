import re
import os
from typing import Dict, Any, List
import PyPDF2
import docx
import openai
from ..config.settings import get_settings

settings = get_settings()

class ResumeParser:
    """Service for parsing and analyzing resume files using OpenAI."""

    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        # Common technical skills to look for
        self.tech_skills = [
            "Python", "Java", "C++", "C", "JavaScript", "TypeScript", "React", "Node.js",
            "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "SQL", "NoSQL",
            "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Linux", "Algorithms",
            "Data Structures", "Web Development", "Mobile Development", "Android", "iOS",
            "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "R", "Matlab",
            "Network Security", "Cryptography", "Distributed Systems", "Cloud Computing"
        ]

        # Cornell CS/Math course patterns
        self.course_pattern = re.compile(r'\b(CS|MATH)\s*\d{4}\b', re.IGNORECASE)

    async def parse_resume(self, file_path: str, content_type: str) -> Dict[str, Any]:
        """
        Parse a resume file and extract relevant information.

        Args:
            file_path: Path to the uploaded file
            content_type: MIME type of the file

        Returns:
            Dictionary containing parsed resume data
        """
        # Extract text based on file type
        if content_type == "application/pdf":
            text = self._extract_pdf_text(file_path)
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            text = self._extract_docx_text(file_path)
        else:  # text/plain
            text = self._extract_txt_text(file_path)

        # Use OpenAI to analyze resume
        analysis = await self._analyze_with_openai(text)

        # Extract course codes from text
        courses = self._extract_courses(text)

        return {
            "skills": analysis.get("skills", []),
            "courses": courses,
            "experience_years": analysis.get("experience_years", 0),
            "summary": analysis.get("summary", ""),
            "career_goal": analysis.get("career_goal", ""),
            "interests": analysis.get("interests", []),
            "current_level": analysis.get("current_level", "sophomore"),
            "raw_text": text[:500]  # First 500 chars for preview
        }

    def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            raise Exception(f"Failed to extract PDF text: {str(e)}")
        return text

    def _extract_docx_text(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        try:
            doc = docx.Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            raise Exception(f"Failed to extract DOCX text: {str(e)}")
        return text

    def _extract_txt_text(self, file_path: str) -> str:
        """Extract text from TXT file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
        except Exception as e:
            raise Exception(f"Failed to read text file: {str(e)}")
        return text

    def _extract_courses(self, text: str) -> List[str]:
        """Extract Cornell CS/MATH course codes from text."""
        courses = self.course_pattern.findall(text)
        # Format as "CS 2110" style
        formatted_courses = [f"{match[0].upper()} {match[1]}" if isinstance(match, tuple) else match.upper()
                           for match in courses]
        return list(set(formatted_courses))  # Remove duplicates

    async def _analyze_with_openai(self, text: str) -> Dict[str, Any]:
        """Use OpenAI to analyze resume and extract structured information."""

        system_prompt = """You are a resume analysis expert specializing in Computer Science and technical resumes.
Analyze the provided resume and extract the following information in JSON format:

{
  "skills": ["skill1", "skill2", ...],  // List of technical skills found
  "experience_years": 0,  // Estimated years of relevant experience (integer)
  "summary": "brief summary",  // 1-2 sentence summary of candidate's background
  "career_goal": "inferred career goal",  // Inferred career objective/goal from resume (e.g., "Machine Learning Engineer", "Software Developer", "Data Scientist")
  "interests": ["interest1", "interest2"],  // Technical interests or focus areas (e.g., "AI/ML", "Web Development", "Cybersecurity")
  "current_level": "freshman|sophomore|junior|senior|graduate"  // Academic level (infer from coursework/experience)
}

Focus on:
- Technical skills (programming languages, frameworks, tools, technologies)
- Years of experience (estimate based on work history and education)
- Academic background and relevant coursework
- Projects and achievements
- Career objectives or goals mentioned in resume or inferred from experience
- Areas of technical interest based on projects, coursework, and experience
- Current academic standing (infer from dates, courses, or graduation year)

Return ONLY valid JSON."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze this resume:\n\n{text[:4000]}"}  # Limit to 4000 chars
                ],
                temperature=0.3,
                max_tokens=1000
            )

            result_text = response.choices[0].message.content.strip()

            # Remove markdown code blocks if present
            if result_text.startswith("```"):
                result_text = re.sub(r'^```(?:json)?\n', '', result_text)
                result_text = re.sub(r'\n```$', '', result_text)

            # Parse JSON
            import json
            analysis = json.loads(result_text)

            return analysis

        except Exception as e:
            # Return default structure on error
            return {
                "skills": self._extract_skills_basic(text),
                "experience_years": 0,
                "summary": "Unable to generate summary",
                "career_goal": "",
                "interests": [],
                "current_level": "sophomore"
            }

    def _extract_skills_basic(self, text: str) -> List[str]:
        """Basic skill extraction without AI (fallback)."""
        found_skills = []
        text_lower = text.lower()

        for skill in self.tech_skills:
            if skill.lower() in text_lower:
                found_skills.append(skill)

        return found_skills
