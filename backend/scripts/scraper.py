"""
Cornell Class Roster API Scraper
Fetches CS and Math courses from Cornell's official API
"""

import requests
import json
import time
from pathlib import Path
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
CORNELL_API_BASE = "https://classes.cornell.edu/api/2.0"
SUBJECTS = ["CS", "MATH"]  # CS + Math only
SEMESTER = "FA25"  # Fall 2025
RATE_LIMIT_DELAY = 1  # 1 second between requests

# Output path
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
OUTPUT_FILE = DATA_DIR / "raw_courses.json"


def extract_instructors(course_group: dict) -> List[str]:
    """
    Extract unique instructor names from a course group's enrollment data.

    The Cornell API nests instructor data inside:
    enrollGroups[] -> classSections[] -> meetings[] -> instructors[]

    Args:
        course_group: Raw course group dict from Cornell API

    Returns:
        List of unique instructor names (first + last)
    """
    instructors = set()

    for enroll_group in course_group.get('enrollGroups', []):
        for section in enroll_group.get('classSections', []):
            for meeting in section.get('meetings', []):
                for instructor in meeting.get('instructors', []):
                    first = instructor.get('firstName', '').strip()
                    last = instructor.get('lastName', '').strip()
                    if first and last:
                        instructors.add(f"{first} {last}")

    return sorted(instructors)


def fetch_courses_for_subject(subject: str, roster: str = SEMESTER) -> List[Dict]:
    """
    Fetch all courses for a given subject from Cornell API

    Args:
        subject: Subject code (e.g., 'CS', 'MATH')
        roster: Semester roster (e.g., 'FA25')

    Returns:
        List of course dictionaries
    """
    courses = []
    url = f"{CORNELL_API_BASE}/search/classes.json"
    params = {
        "roster": roster,
        "subject": subject
    }

    try:
        logger.info(f"Fetching {subject} courses for {roster}...")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        # Extract courses from API response
        if "data" in data and "classes" in data["data"]:
            for course_group in data["data"]["classes"]:
                # Extract course metadata
                course_id = f"{subject} {course_group.get('catalogNbr', 'UNKNOWN')}"
                title = course_group.get('titleLong', '').strip()
                description = course_group.get('description', '').strip()

                # Extract prerequisites (may be in different fields)
                prerequisites = (
                    course_group.get('catalogPrereqCoreq', '') or
                    course_group.get('catalogPrerequisites', '') or
                    ''
                ).strip()

                # Extract instructor names
                instructors = extract_instructors(course_group)

                courses.append({
                    "course_id": course_id,
                    "subject": subject,
                    "catalog_number": course_group.get('catalogNbr', ''),
                    "title": title,
                    "description": description,
                    "prerequisites": prerequisites,
                    "instructors": instructors,
                    "semester": roster
                })

        logger.info(f"✓ Fetched {len(courses)} {subject} courses")
        instructors_found = sum(1 for c in courses if c['instructors'])
        logger.info(f"  {instructors_found} courses have instructor data")

    except requests.exceptions.RequestException as e:
        logger.error(f"✗ Error fetching {subject} courses: {e}")

    return courses


def scrape_all_courses() -> Dict:
    """
    Scrape all CS and Math courses

    Returns:
        Dictionary with 'courses' key containing list of all courses
    """
    all_courses = []

    for subject in SUBJECTS:
        courses = fetch_courses_for_subject(subject)
        all_courses.extend(courses)

        # Rate limiting
        if subject != SUBJECTS[-1]:  # Don't delay after last subject
            logger.info(f"Waiting {RATE_LIMIT_DELAY}s (rate limiting)...")
            time.sleep(RATE_LIMIT_DELAY)

    logger.info(f"\n{'='*60}")
    logger.info(f"SUMMARY: Scraped {len(all_courses)} total courses")
    logger.info(f"  - CS: {sum(1 for c in all_courses if c['subject'] == 'CS')} courses")
    logger.info(f"  - MATH: {sum(1 for c in all_courses if c['subject'] == 'MATH')} courses")

    # Count unique instructors
    all_instructors = set()
    for c in all_courses:
        all_instructors.update(c.get('instructors', []))
    logger.info(f"  - Unique instructors: {len(all_instructors)}")
    logger.info(f"{'='*60}\n")

    return {"courses": all_courses}


def save_courses(data: Dict, output_path: Path = OUTPUT_FILE):
    """Save courses to JSON file"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info(f"✓ Saved to {output_path}")
    logger.info(f"  File size: {output_path.stat().st_size / 1024:.1f} KB")


def main():
    """Main execution"""
    logger.info("Starting Cornell Class Roster scraper...")
    logger.info(f"Subjects: {', '.join(SUBJECTS)}")
    logger.info(f"Semester: {SEMESTER}\n")

    # Scrape courses
    data = scrape_all_courses()

    # Save to file
    save_courses(data)

    logger.info("\n✅ Scraping completed successfully!")


if __name__ == "__main__":
    main()
