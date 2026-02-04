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
PREREQ_FILE = DATA_DIR / "prerequisites.json"


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
                if rmp_course.get('avg_difficulty') is not None:
                    node['difficulty_score'] = rmp_course['avg_difficulty']
                if rmp_course.get('avg_enjoyment') is not None:
                    node['enjoyment_score'] = rmp_course['avg_enjoyment']
                node['score_source'] = 'rmp'

    # Merge prerequisite data into nodes and populate links
    prereqs = {}
    if PREREQ_FILE.exists():
        try:
            with open(PREREQ_FILE, 'r') as f:
                prereqs = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load prerequisites: {e}")

    if prereqs:
        # Build reverse map: course -> list of courses it unlocks
        unlocks_map: dict = {}
        for course_id, prereq_list in prereqs.items():
            for prereq in prereq_list:
                unlocks_map.setdefault(prereq, []).append(course_id)

        # Add prerequisites/unlocks arrays and update degree counts
        for node in graph_data.get('nodes', []):
            course_id = node.get('id')
            node['prerequisites'] = prereqs.get(course_id, [])
            node['unlocks'] = unlocks_map.get(course_id, [])
            node['in_degree'] = len(node['prerequisites'])
            node['out_degree'] = len(node['unlocks'])

        # Populate links array from prerequisites
        links = []
        for course_id, prereq_list in prereqs.items():
            for prereq in prereq_list:
                links.append({"source": prereq, "target": course_id})
        graph_data['links'] = links

    return graph_data
