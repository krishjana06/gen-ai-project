from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..services.materials_service import MaterialsService

router = APIRouter()
materials_service = MaterialsService()

@router.get("/study-materials/{course_code}")
async def get_study_materials(course_code: str) -> Dict[str, Any]:
    """
    Get curated study materials for a specific course.

    Args:
        course_code: Course code (e.g., "CS 2110" or "CS2110")

    Returns:
        - course_code: Formatted course code
        - course_title: Full course title
        - materials: List of study resources with type, difficulty, etc.
    """
    # Normalize course code (handle both "CS 2110" and "CS2110" formats)
    normalized_code = course_code.upper().replace(" ", "")

    try:
        materials = await materials_service.get_materials(normalized_code)

        if not materials:
            raise HTTPException(
                status_code=404,
                detail=f"No study materials found for course {course_code}"
            )

        return materials

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch study materials: {str(e)}"
        )
