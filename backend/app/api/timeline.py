"""
Timeline API endpoint - Generate personalized course timelines
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.timeline_planner import TimelinePlanner
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()


class TimelineRequest(BaseModel):
    career_goal: str
    completed_courses: List[str] = []
    current_semester: Optional[str] = "Sophomore Fall"
    resume_data: Optional[Dict[str, Any]] = None  # Optional resume analysis data


class TimelineResponse(BaseModel):
    analysis: Dict[str, Any]
    paths: Dict[str, Any]


@router.post("/plan-timeline", response_model=TimelineResponse)
async def plan_timeline(request: TimelineRequest):
    """
    Generate 3 personalized timeline paths based on career goal

    Args:
        request: TimelineRequest with career goal and completed courses

    Returns:
        TimelineResponse with analysis and 3 path options (theorist, engineer, balanced)
    """
    try:
        # Load available courses from graph data
        available_courses = []
        try:
            with open('/Users/krishjana/Desktop/gen-ai-project/backend/data/graph_data.json', 'r') as f:
                graph_data = json.load(f)
                available_courses = graph_data.get('nodes', [])
        except Exception as e:
            logger.warning(f"Could not load course data: {e}")

        # Generate timelines
        planner = TimelinePlanner()
        result = planner.generate_timelines(
            career_goal=request.career_goal,
            completed_courses=request.completed_courses,
            current_semester=request.current_semester,
            available_courses=available_courses
        )

        return TimelineResponse(
            analysis=result.get('analysis', {}),
            paths=result.get('paths', {})
        )

    except ValueError as e:
        logger.error(f"Timeline planning error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in timeline planning: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate timelines")
