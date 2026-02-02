"""
Graph API endpoint - Serves the course prerequisite graph
"""

from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Paths to data files
DATA_DIR = Path(__file__).parent.parent.parent / "data"
GRAPH_FILE = DATA_DIR / "graph_data.json"
RMP_FILE = DATA_DIR / "rmp_data.json"


@router.get("/graph")
async def get_graph():
    """
    Get the complete course graph with RMP difficulty/enjoyment scores merged in

    Returns:
        JSON graph data in node-link format with RMP scores
    """
    if not GRAPH_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="Graph data not found. Please run build_graph.py first."
        )

    # Load base graph data
    with open(GRAPH_FILE, 'r') as f:
        graph_data = json.load(f)

    # Load RMP data if available
    rmp_data = {}
    if RMP_FILE.exists():
        try:
            with open(RMP_FILE, 'r') as f:
                rmp_data = json.load(f)
            logger.info(f"Loaded RMP data for {len(rmp_data)} courses")
        except Exception as e:
            logger.warning(f"Failed to load RMP data: {e}")

    # Merge RMP scores into graph nodes
    if rmp_data:
        for node in graph_data.get('nodes', []):
            course_id = node.get('id')
            if course_id and course_id in rmp_data:
                rmp_course = rmp_data[course_id]
                # Override difficulty and enjoyment with RMP scores
                if rmp_course.get('avg_difficulty') is not None:
                    node['difficulty_score'] = rmp_course['avg_difficulty']
                if rmp_course.get('avg_enjoyment') is not None:
                    node['enjoyment_score'] = rmp_course['avg_enjoyment']
                # Add source indicator
                node['score_source'] = 'rmp'

    return graph_data
