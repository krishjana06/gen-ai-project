from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from ..services.job_matcher import JobMatcherService

router = APIRouter()
job_matcher = JobMatcherService()

class JobMatchRequest(BaseModel):
    job_description: str

@router.post("/match-job")
async def match_job(request: JobMatchRequest) -> Dict[str, Any]:
    """
    Match a job description with relevant Cornell CS/Math courses.

    Args:
        job_description: The full job description text

    Returns:
        - matched_courses: List of courses with relevance scores
        - recommended_paths: Suggested learning paths
        - skill_gaps: Skills mentioned in job but not covered
        - overall_match_score: Overall match percentage
    """
    if not request.job_description or not request.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty"
        )

    try:
        result = await job_matcher.match_job_to_courses(request.job_description)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to match job description: {str(e)}"
        )
