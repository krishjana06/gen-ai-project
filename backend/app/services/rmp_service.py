"""
Rate My Professor Data Service
Loads pre-scraped RMP data and provides course-level lookups
"""

import json
from pathlib import Path
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

# Path to pre-scraped RMP data
DATA_DIR = Path(__file__).parent.parent.parent / "data"
RMP_FILE = DATA_DIR / "rmp_data.json"
GRAPH_FILE = DATA_DIR / "graph_data.json"

# Cached data (loaded once at import time)
_rmp_data: Dict = {}
_graph_nodes: Dict = {}


def _load_rmp_data():
    """Load RMP data from JSON file"""
    global _rmp_data
    if RMP_FILE.exists():
        try:
            with open(RMP_FILE, 'r') as f:
                _rmp_data = json.load(f)
            logger.info(f"Loaded RMP data for {len(_rmp_data)} courses")
        except Exception as e:
            logger.warning(f"Failed to load RMP data: {e}")
            _rmp_data = {}
    else:
        logger.info("No RMP data file found - RMP features will be unavailable")
        _rmp_data = {}


def _load_graph_data():
    """Load graph data to get Reddit sentiment scores per course"""
    global _graph_nodes
    if GRAPH_FILE.exists():
        try:
            with open(GRAPH_FILE, 'r') as f:
                graph = json.load(f)
            # Index nodes by course ID for fast lookup
            for node in graph.get('nodes', []):
                node_id = node.get('id', '')
                if node_id:
                    _graph_nodes[node_id] = node
            logger.info(f"Loaded graph data for {len(_graph_nodes)} courses")
        except Exception as e:
            logger.warning(f"Failed to load graph data: {e}")
            _graph_nodes = {}
    else:
        logger.info("No graph data file found")
        _graph_nodes = {}


# Load data at module import
_load_rmp_data()
_load_graph_data()


def get_rmp_data(course_id: str) -> Optional[Dict]:
    """
    Get RMP professor data for a given course.

    Args:
        course_id: Course ID (e.g., "CS 2110")

    Returns:
        Dictionary with professor data, or None if not available
    """
    return _rmp_data.get(course_id)


def get_reddit_sentiment(course_id: str) -> Optional[Dict]:
    """
    Get Reddit sentiment data for a given course from the graph.

    Args:
        course_id: Course ID (e.g., "CS 2110")

    Returns:
        Dictionary with difficulty_score, enjoyment_score, comment_count, confidence
    """
    node = _graph_nodes.get(course_id)
    if not node:
        return None

    comment_count = node.get('comment_count', 0)
    if comment_count == 0:
        return None

    return {
        "difficulty_score": node.get('difficulty_score', 5.0),
        "enjoyment_score": node.get('enjoyment_score', 5.0),
        "comment_count": comment_count,
        "confidence": node.get('confidence', 'none'),
    }


def get_course_info(course_id: str) -> Optional[Dict]:
    """
    Get basic course info from the graph.

    Args:
        course_id: Course ID (e.g., "CS 2110")

    Returns:
        Dictionary with title and description
    """
    node = _graph_nodes.get(course_id)
    if not node:
        return None
    return {
        "title": node.get('title', ''),
        "description": node.get('description', ''),
    }


def format_course_context(course_ids: List[str]) -> str:
    """
    Format RMP and Reddit data for a list of courses into a context string
    suitable for injection into an LLM prompt.

    Args:
        course_ids: List of course IDs mentioned in the conversation

    Returns:
        Formatted context string, or empty string if no data available
    """
    if not course_ids:
        return ""

    context_parts = []

    for course_id in course_ids:
        parts = []

        # Course info
        info = get_course_info(course_id)
        if info and info['title']:
            parts.append(f"  Title: {info['title']}")

        # Reddit sentiment
        reddit = get_reddit_sentiment(course_id)
        if reddit:
            parts.append(
                f"  Reddit reviews: Difficulty {reddit['difficulty_score']}/10, "
                f"Enjoyment {reddit['enjoyment_score']}/10 "
                f"({reddit['comment_count']} reviews, {reddit['confidence']} confidence)"
            )

        # RMP data
        rmp = get_rmp_data(course_id)
        if rmp and rmp.get('professors'):
            for prof in rmp['professors']:
                rmp_line = f"  RateMyProfessor: Prof. {prof['name']}"
                rmp_line += f" — {prof['rating']}/5 rating"
                rmp_line += f", {prof['difficulty']}/5 difficulty"
                if prof.get('would_take_again') is not None:
                    rmp_line += f", {prof['would_take_again']}% would take again"
                rmp_line += f" ({prof['num_ratings']} ratings)"
                parts.append(rmp_line)

        if parts:
            context_parts.append(f"[{course_id}]\n" + "\n".join(parts))

    if not context_parts:
        return ""

    return "\n\n".join(context_parts)
