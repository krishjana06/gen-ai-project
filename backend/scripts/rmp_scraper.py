"""
Rate My Professor Scraper for Cornell CS and Math Courses
Fetches professor ratings from RateMyProfessors.com via GraphQL API
and maps them to courses.

Note: The RateMyProfessorAPI pip package's search functions are broken
(RMP returns 403 on HTML pages). This script uses the GraphQL API
directly, which still works with the Basic auth header.
"""

import json
import time
import base64
import requests
from pathlib import Path
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
SCHOOL_NAME = "Cornell University"
CORNELL_RMP_ID = 298  # Cornell's known RMP school ID
RATE_LIMIT_DELAY = 1.0  # Seconds between RMP lookups

# RMP GraphQL API (the HTML pages return 403, but GraphQL still works)
RMP_GRAPHQL_URL = "https://www.ratemyprofessors.com/graphql"
RMP_HEADERS = {
    "Authorization": "Basic dGVzdDp0ZXN0",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    "Content-Type": "application/json",
}

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "raw_courses.json"
OUTPUT_FILE = DATA_DIR / "rmp_data.json"


def search_professor_graphql(name: str, school_id: int) -> Optional[int]:
    """
    Search for a professor at a specific school using the RMP GraphQL API.

    Args:
        name: Professor's name (e.g., "David Gries")
        school_id: RMP school ID (298 for Cornell)

    Returns:
        The professor's legacy ID if found, or None
    """
    query = {
        "query": (
            "query NewSearchTeachersQuery($query: TeacherSearchQuery!) {"
            "newSearch {teachers(query: $query) {didFallback edges {cursor node {"
            "id legacyId firstName lastName school {name id} department"
            "}}}}}"
        ),
        "variables": {
            "query": {
                "text": name,
                "schoolID": base64.b64encode(
                    f"School-{school_id}".encode()
                ).decode(),
            }
        },
    }

    try:
        resp = requests.post(
            RMP_GRAPHQL_URL, json=query, headers=RMP_HEADERS, timeout=10
        )
        if resp.status_code != 200:
            logger.debug(f"  GraphQL search returned {resp.status_code}")
            return None

        data = resp.json()
        edges = (
            data.get("data", {})
            .get("newSearch", {})
            .get("teachers", {})
            .get("edges", [])
        )

        if not edges:
            return None

        # Return the first matching professor's legacy ID
        node = edges[0]["node"]
        return int(node["legacyId"])

    except Exception as e:
        logger.debug(f"  GraphQL search error for {name}: {e}")
        return None


def get_professor_details(professor_id: int) -> Optional[Dict]:
    """
    Get full professor details from RMP GraphQL API.

    Args:
        professor_id: The professor's legacy ID

    Returns:
        Dictionary with professor data, or None if not found
    """
    query = {
        "query": (
            "query RatingsListQuery($id: ID!) {node(id: $id) {... on Teacher {"
            "school {id} courseCodes {courseName courseCount} "
            "firstName lastName numRatings avgDifficulty avgRating "
            "department wouldTakeAgainPercent"
            "}}}"
        ),
        "variables": {
            "id": base64.b64encode(
                f"Teacher-{professor_id}".encode()
            ).decode()
        },
    }

    try:
        resp = requests.post(
            RMP_GRAPHQL_URL, json=query, headers=RMP_HEADERS, timeout=10
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        node = data.get("data", {}).get("node")
        if not node:
            return None

        num_ratings = node.get("numRatings", 0)
        if num_ratings == 0:
            return None

        would_take_again = node.get("wouldTakeAgainPercent", 0)
        if would_take_again == 0 or would_take_again == -1:
            would_take_again = None
        else:
            would_take_again = round(would_take_again, 1)

        return {
            "name": f"{node.get('firstName', '')} {node.get('lastName', '')}".strip(),
            "department": node.get("department", ""),
            "rating": node.get("avgRating", 0),
            "difficulty": node.get("avgDifficulty", 0),
            "num_ratings": num_ratings,
            "would_take_again": would_take_again,
        }

    except Exception as e:
        logger.debug(f"  GraphQL detail error for ID {professor_id}: {e}")
        return None


def lookup_professor(name: str) -> Optional[Dict]:
    """
    Look up a professor on RateMyProfessors at Cornell.

    Uses GraphQL API to search by name, then fetches full details.

    Args:
        name: Professor's full name (e.g., "David Gries")

    Returns:
        Dictionary with professor rating data, or None if not found
    """
    # Step 1: Search for professor at Cornell
    professor_id = search_professor_graphql(name, CORNELL_RMP_ID)
    if not professor_id:
        return None

    # Step 2: Get full details
    return get_professor_details(professor_id)


def scrape_rmp_for_courses() -> Dict:
    """
    Scrape RateMyProfessors data for all courses with instructor information.

    Reads raw_courses.json to get course -> instructor mappings,
    then looks up each instructor on RMP via GraphQL.

    Returns:
        Dictionary mapping course_id to professor rating data
    """
    # Load courses with instructor data
    if not INPUT_FILE.exists():
        logger.error(f"{INPUT_FILE} not found. Run scraper.py first.")
        return {}

    with open(INPUT_FILE, 'r') as f:
        data = json.load(f)
    courses = data.get('courses', [])

    logger.info(f"Loaded {len(courses)} courses from {INPUT_FILE}")
    logger.info(f"Using school: {SCHOOL_NAME} (RMP ID: {CORNELL_RMP_ID})")

    # Collect unique instructors across all courses
    instructor_to_courses: Dict[str, List[str]] = {}
    for course in courses:
        for instructor in course.get('instructors', []):
            if instructor not in instructor_to_courses:
                instructor_to_courses[instructor] = []
            instructor_to_courses[instructor].append(course['course_id'])

    logger.info(f"Found {len(instructor_to_courses)} unique instructors to look up\n")

    # Look up each instructor on RMP (with caching)
    professor_cache: Dict[str, Optional[Dict]] = {}
    rmp_data: Dict[str, Dict] = {}

    for i, (instructor_name, course_ids) in enumerate(instructor_to_courses.items(), 1):
        logger.info(f"[{i}/{len(instructor_to_courses)}] Looking up: {instructor_name}")

        if instructor_name in professor_cache:
            prof_data = professor_cache[instructor_name]
        else:
            prof_data = lookup_professor(instructor_name)
            professor_cache[instructor_name] = prof_data

            if prof_data:
                logger.info(
                    f"  ✓ Found: {prof_data['name']} — "
                    f"{prof_data['rating']}/5 rating, "
                    f"{prof_data['num_ratings']} reviews"
                )
            else:
                logger.info(f"  ✗ Not found or no ratings")

            # Rate limiting
            time.sleep(RATE_LIMIT_DELAY)

        # Map professor data to each course they teach
        if prof_data:
            for course_id in course_ids:
                if course_id not in rmp_data:
                    rmp_data[course_id] = {"professors": []}

                # Avoid duplicate entries
                existing_names = [
                    p['name'] for p in rmp_data[course_id]['professors']
                ]
                if prof_data['name'] not in existing_names:
                    rmp_data[course_id]['professors'].append(prof_data)

    # Summary
    professors_found = len([p for p in professor_cache.values() if p is not None])
    courses_with_data = len(rmp_data)

    logger.info(f"\n{'='*60}")
    logger.info(f"RMP SCRAPING SUMMARY:")
    logger.info(f"  Instructors looked up: {len(instructor_to_courses)}")
    logger.info(f"  Instructors found on RMP: {professors_found}")
    logger.info(f"  Courses with RMP data: {courses_with_data}")
    logger.info(f"  Courses without RMP data: {len(courses) - courses_with_data}")
    logger.info(f"{'='*60}\n")

    return rmp_data


def save_rmp_data(data: Dict, output_path: Path = OUTPUT_FILE):
    """Save RMP data to JSON file"""
    DATA_DIR.mkdir(exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info(f"✓ Saved to {output_path}")
    logger.info(f"  File size: {output_path.stat().st_size / 1024:.1f} KB")


def main():
    """Main execution"""
    logger.info("Starting Rate My Professor scraper (GraphQL)...")
    logger.info(f"School: {SCHOOL_NAME} (ID: {CORNELL_RMP_ID})\n")

    # Scrape RMP data
    data = scrape_rmp_for_courses()

    # Save to file
    save_rmp_data(data)

    logger.info("\n✅ RMP scraping completed!")


if __name__ == "__main__":
    main()
