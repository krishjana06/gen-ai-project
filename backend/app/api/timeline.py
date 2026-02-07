"""
Timeline API endpoint - Generate personalized course timelines
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.timeline_planner import TimelinePlanner
from pathlib import Path
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

# Paths to data files (use relative paths for deployment)
DATA_DIR = Path(__file__).parent.parent.parent / "data"
GRAPH_FILE = DATA_DIR / "graph_data.json"
PREREQ_FILE = DATA_DIR / "prerequisites.json"


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
        if GRAPH_FILE.exists():
            try:
                with open(GRAPH_FILE, 'r') as f:
                    graph_data = json.load(f)
                    available_courses = graph_data.get('nodes', [])
            except Exception as e:
                logger.warning(f"Could not load course data: {e}")
        else:
            logger.error(f"Graph file not found: {GRAPH_FILE}")

        # Load prerequisites
        prereqs = {}
        if PREREQ_FILE.exists():
            try:
                with open(PREREQ_FILE, 'r') as f:
                    prereqs = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load prerequisites: {e}")
        else:
            logger.error(f"Prerequisites file not found: {PREREQ_FILE}")

        # Generate timelines
        planner = TimelinePlanner()
        result = planner.generate_timelines(
            career_goal=request.career_goal,
            completed_courses=request.completed_courses,
            current_semester=request.current_semester,
            available_courses=available_courses,
            prerequisites=prereqs
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
