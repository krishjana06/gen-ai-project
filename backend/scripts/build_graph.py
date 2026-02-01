"""
Graph Builder - Constructs NetworkX graph with prerequisites and sentiment
"""

import json
import networkx as nx
from pathlib import Path
import sys
import logging

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.gemini_service import GeminiPrerequisiteParser

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
COURSES_FILE = DATA_DIR / "raw_courses.json"
SENTIMENT_FILE = DATA_DIR / "sentiment_scores.json"
OUTPUT_FILE = DATA_DIR / "graph_data.json"


def load_data():
    """Load courses and sentiment data"""
    with open(COURSES_FILE, 'r') as f:
        courses_data = json.load(f)

    # Load sentiment scores (may not exist)
    sentiment_scores = {}
    if SENTIMENT_FILE.exists():
        with open(SENTIMENT_FILE, 'r') as f:
            sentiment_scores = json.load(f)
    else:
        logger.warning(f"{SENTIMENT_FILE} not found - using neutral sentiment scores")

    return courses_data['courses'], sentiment_scores


def build_graph(courses: list, sentiment_scores: dict) -> nx.DiGraph:
    """
    Build NetworkX directed graph with courses and prerequisites

    Args:
        courses: List of course dictionaries
        sentiment_scores: Dictionary of sentiment scores by course_id

    Returns:
        NetworkX DiGraph
    """
    G = nx.DiGraph()
    parser = GeminiPrerequisiteParser()

    logger.info(f"Building graph from {len(courses)} courses...")

    # Add nodes
    for i, course in enumerate(courses, 1):
        course_id = course['course_id']

        # Get sentiment scores (default to neutral if not available)
        sentiment = sentiment_scores.get(course_id, {
            "difficulty": 5.0,
            "enjoyment": 5.0,
            "comment_count": 0,
            "confidence": "none"
        })

        # Add node with attributes
        G.add_node(
            course_id,
            title=course['title'],
            description=course.get('description', ''),
            subject=course['subject'],
            catalog_number=course['catalog_number'],
            difficulty_score=sentiment.get('difficulty', 5.0),
            enjoyment_score=sentiment.get('enjoyment', 5.0),
            comment_count=sentiment.get('comment_count', 0),
            confidence=sentiment.get('confidence', 'none')
        )

        if i % 50 == 0:
            logger.info(f"  Added {i}/{len(courses)} nodes...")

    logger.info(f"✓ Added {G.number_of_nodes()} nodes")

    # Add edges (prerequisites)
    edge_count = 0
    for i, course in enumerate(courses, 1):
        course_id = course['course_id']
        prereq_text = course.get('prerequisites', '')

        if prereq_text:
            # Parse prerequisites
            prereqs = parser.parse_prerequisites(prereq_text)

            # Add edges from prerequisites to this course
            for prereq in prereqs:
                if prereq in G:  # Only add edge if prerequisite course exists
                    G.add_edge(prereq, course_id)
                    edge_count += 1

        if i % 50 == 0:
            logger.info(f"  Processed {i}/{len(courses)} prerequisites...")

    logger.info(f"✓ Added {edge_count} prerequisite edges")

    # Calculate graph metrics
    logger.info("Calculating graph metrics...")

    for node in G.nodes():
        # In-degree = number of prerequisites
        G.nodes[node]['in_degree'] = G.in_degree(node)
        # Out-degree = number of courses this unlocks
        G.nodes[node]['out_degree'] = G.out_degree(node)

    # Calculate centrality (importance)
    if G.number_of_nodes() > 0:
        try:
            centrality = nx.pagerank(G)
            for node in G.nodes():
                G.nodes[node]['centrality'] = round(centrality.get(node, 0.0), 4)
        except:
            logger.warning("Could not calculate PageRank - using default values")
            for node in G.nodes():
                G.nodes[node]['centrality'] = 0.0

    logger.info(f"\n{'='*60}")
    logger.info(f"GRAPH SUMMARY:")
    logger.info(f"  Nodes: {G.number_of_nodes()}")
    logger.info(f"  Edges: {G.number_of_edges()}")
    logger.info(f"  Avg in-degree: {sum(d for n, d in G.in_degree()) / G.number_of_nodes():.2f}")
    logger.info(f"  Avg out-degree: {sum(d for n, d in G.out_degree()) / G.number_of_nodes():.2f}")
    logger.info(f"{'='*60}\n")

    return G


def export_graph(G: nx.DiGraph, output_path: Path = OUTPUT_FILE):
    """Export graph to JSON (node-link format)"""
    data = nx.node_link_data(G)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info(f"✓ Saved graph to {output_path}")
    logger.info(f"  File size: {output_path.stat().st_size / 1024:.1f} KB")


def main():
    """Main execution"""
    logger.info("Starting graph construction...")

    # Load data
    courses, sentiment_scores = load_data()

    # Build graph
    G = build_graph(courses, sentiment_scores)

    # Export to JSON
    export_graph(G)

    logger.info("\n✅ Graph construction completed!")


if __name__ == "__main__":
    main()
