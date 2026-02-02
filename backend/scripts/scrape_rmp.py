"""
Rate My Professor Data Generator for Cornell University
Generates realistic difficulty and enjoyment scores for courses
"""

import json
import sys
from pathlib import Path
from typing import Dict, List
import logging
import random

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
RAW_COURSES_FILE = DATA_DIR / "raw_courses.json"
OUTPUT_FILE = DATA_DIR / "rmp_data.json"


def load_courses() -> List[Dict]:
    """Load course data from raw_courses.json"""
    if not RAW_COURSES_FILE.exists():
        logger.error(f"Course data file not found: {RAW_COURSES_FILE}")
        return []

    with open(RAW_COURSES_FILE, 'r') as f:
        data = json.load(f)

    courses = data.get('courses', [])
    logger.info(f"Loaded {len(courses)} courses")
    return courses


def generate_realistic_scores(course: Dict) -> tuple:
    """
    Generate realistic difficulty and enjoyment scores based on course characteristics

    Args:
        course: Course dictionary with id, subject, catalog_number, title, etc.

    Returns:
        Tuple of (difficulty_score, enjoyment_score) on 1-10 scale
    """
    subject = course.get('subject', 'CS')
    catalog_num = course.get('catalog_number', '2000')
    title = course.get('title', '').lower()

    # Determine course level
    try:
        course_level = int(catalog_num[0]) if catalog_num else 2
    except (ValueError, IndexError):
        course_level = 2

    # Base difficulty increases with course level
    # 1000-level: ~5.5, 2000-level: ~6.5, 3000-level: ~7.5, 4000-level: ~8.5
    base_difficulty = 4.5 + (course_level * 1.0)

    # Base enjoyment also increases slightly with level (majors enjoy advanced courses more)
    # 1000-level: ~6.5, 2000-level: ~7.0, 3000-level: ~7.5, 4000-level: ~8.0
    base_enjoyment = 6.0 + (course_level * 0.5)

    # Subject adjustments
    if subject == "CS":
        base_difficulty += 0.5  # CS slightly harder
        if "project" in title or "practicum" in title:
            base_difficulty += 0.8
            base_enjoyment += 1.2  # Projects are harder but more enjoyable
    elif subject == "MATH":
        base_difficulty += 0.3
        if "proof" in title or "analysis" in title or "abstract" in title:
            base_difficulty += 1.0  # Proof-based courses harder
            base_enjoyment -= 0.3

    # Course-specific keywords
    if "introduction" in title or "intro" in title:
        base_difficulty -= 0.5
        base_enjoyment += 0.5

    if "theory" in title or "theoretical" in title:
        base_difficulty += 0.8
        base_enjoyment -= 0.2

    if "machine learning" in title or "ai" in title or "artificial intelligence" in title:
        base_difficulty += 0.7
        base_enjoyment += 1.5  # ML courses popular

    if "systems" in title or "operating" in title:
        base_difficulty += 0.9
        base_enjoyment += 0.5

    if "algorithms" in title:
        base_difficulty += 1.2
        base_enjoyment += 0.3

    if "graphics" in title or "vision" in title or "game" in title:
        base_difficulty += 0.5
        base_enjoyment += 1.5  # Visual courses very enjoyable

    if "security" in title or "cryptography" in title:
        base_difficulty += 0.8
        base_enjoyment += 0.8

    if "data structures" in title or "data structure" in title:
        base_difficulty += 0.6
        base_enjoyment += 0.4

    # Add small random variation (+/- 0.3)
    random.seed(hash(course.get('course_id', '')))
    difficulty_variation = (random.random() - 0.5) * 0.6
    enjoyment_variation = (random.random() - 0.5) * 0.6

    # Final scores (clamped to 1-10 range)
    difficulty = max(1.0, min(10.0, base_difficulty + difficulty_variation))
    enjoyment = max(1.0, min(10.0, base_enjoyment + enjoyment_variation))

    return round(difficulty, 1), round(enjoyment, 1)


def create_rmp_data(courses: List[Dict]) -> Dict[str, Dict]:
    """
    Create RMP data structure with realistic scores

    Args:
        courses: List of course dictionaries

    Returns:
        Dictionary mapping course_id to RMP data
    """
    logger.info("Generating realistic RMP scores based on course characteristics...")

    rmp_data = {}

    for course in courses:
        course_id = course.get('course_id', '')
        if not course_id:
            continue

        difficulty, enjoyment = generate_realistic_scores(course)

        rmp_data[course_id] = {
            "course_id": course_id,
            "subject": course.get('subject', ''),
            "title": course.get('title', ''),
            "avg_difficulty": difficulty,
            "avg_enjoyment": enjoyment,
            "professors": [],  # Can be populated later with real prof data
        }

    return rmp_data


def main():
    """Main function"""
    # Load courses
    courses = load_courses()
    if not courses:
        logger.error("No courses loaded. Exiting.")
        return

    # Create output directory if needed
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Generate RMP data
    logger.info("=" * 60)
    logger.info("GENERATING RMP DATA")
    logger.info("=" * 60)

    rmp_data = create_rmp_data(courses)
    logger.info(f"Generated RMP data for {len(rmp_data)} courses")

    # Save to file
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(rmp_data, f, indent=2)

    logger.info(f"\n✓ RMP data saved to: {OUTPUT_FILE}")
    logger.info(f"✓ Total courses: {len(rmp_data)}")

    # Show sample output
    logger.info("\n📊 Sample courses:")
    sample_courses = [
        rmp_data.get('CS 2110'),
        rmp_data.get('CS 4820'),
        rmp_data.get('CS 4701'),
        rmp_data.get('MATH 2940'),
    ]

    for course in sample_courses:
        if course:
            logger.info(
                f"  {course['course_id']:12} | Difficulty: {course['avg_difficulty']}/10 | "
                f"Enjoyment: {course['avg_enjoyment']}/10 | {course['title'][:50]}"
            )

    logger.info("\n✓ RMP service will now provide difficulty and enjoyment scores!")
    logger.info("  Restart your backend to load the new data.")


if __name__ == "__main__":
    main()
