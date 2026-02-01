"""
Graph API endpoint - Serves the course prerequisite graph
"""

from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter()

# Path to graph data
GRAPH_FILE = Path(__file__).parent.parent.parent / "data" / "graph_data.json"


@router.get("/graph")
async def get_graph():
    """
    Get the complete course graph

    Returns:
        JSON graph data in node-link format
    """
    if not GRAPH_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="Graph data not found. Please run build_graph.py first."
        )

    with open(GRAPH_FILE, 'r') as f:
        graph_data = json.load(f)

    return graph_data
