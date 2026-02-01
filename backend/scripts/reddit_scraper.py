"""
Reddit Scraper for Course Sentiment Analysis
Scrapes r/Cornell for mentions of CS and Math courses
"""

import praw
import json
import time
from pathlib import Path
from typing import Dict, List
import logging
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
SUBREDDIT = "Cornell"
TIME_FILTER = "year"  # Past 2 years
SEARCH_LIMIT = 50  # Max posts per course
RATE_LIMIT_DELAY = 1.5  # Seconds between requests

# Output path
DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "raw_courses.json"
OUTPUT_FILE = DATA_DIR / "reddit_comments.json"


def get_reddit_client():
    """Initialize Reddit API client"""
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    user_agent = os.getenv("REDDIT_USER_AGENT", "CourseGraph:v1.0")

    if not client_id or not client_secret:
        logger.warning("Reddit credentials not found in .env file")
        logger.warning("Skipping Reddit scraping - will use default sentiment scores")
        return None

    return praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent
    )


def search_course_mentions(reddit, course_id: str) -> List[Dict]:
    """
    Search Reddit for mentions of a specific course

    Args:
        reddit: PRAW Reddit instance
        course_id: Course ID (e.g., "CS 4820")

    Returns:
        List of comment dictionaries
    """
    if not reddit:
        return []

    comments = []

    try:
        subreddit = reddit.subreddit(SUBREDDIT)

        # Search for course mentions
        for submission in subreddit.search(course_id, time_filter=TIME_FILTER, limit=SEARCH_LIMIT):
            # Extract post title
            if course_id.lower() in submission.title.lower():
                comments.append({
                    "text": submission.title,
                    "score": submission.score,
                    "timestamp": submission.created_utc,
                    "post_id": submission.id,
                    "is_submission": True
                })

            # Extract comments
            submission.comments.replace_more(limit=0)  # Expand comment tree
            for comment in submission.comments.list()[:10]:  # Top 10 comments
                if hasattr(comment, 'body') and course_id.lower() in comment.body.lower():
                    comments.append({
                        "text": comment.body,
                        "score": comment.score,
                        "timestamp": comment.created_utc,
                        "post_id": submission.id,
                        "is_submission": False
                    })

        logger.info(f"  Found {len(comments)} mentions of {course_id}")

    except Exception as e:
        logger.error(f"  Error searching for {course_id}: {e}")

    return comments


def scrape_all_courses() -> Dict[str, List[Dict]]:
    """
    Scrape Reddit for all courses

    Returns:
        Dictionary mapping course IDs to lists of comments
    """
    # Load courses
    with open(INPUT_FILE, 'r') as f:
        data = json.load(f)
    courses = data['courses']

    logger.info(f"Loaded {len(courses)} courses from {INPUT_FILE}")

    # Initialize Reddit client
    reddit = get_reddit_client()
    if not reddit:
        logger.warning("Reddit scraping skipped - returning empty results")
        return {}

    # Scrape comments for each course
    all_comments = {}

    for i, course in enumerate(courses, 1):
        course_id = course['course_id']
        logger.info(f"[{i}/{len(courses)}] Searching for: {course_id}")

        comments = search_course_mentions(reddit, course_id)
        if comments:
            all_comments[course_id] = comments

        # Rate limiting
        time.sleep(RATE_LIMIT_DELAY)

    logger.info(f"\n{'='*60}")
    logger.info(f"SUMMARY: Found mentions for {len(all_comments)} courses")
    logger.info(f"Total comments collected: {sum(len(c) for c in all_comments.values())}")
    logger.info(f"{'='*60}\n")

    return all_comments


def save_comments(data: Dict, output_path: Path = OUTPUT_FILE):
    """Save comments to JSON file"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info(f"✓ Saved to {output_path}")
    logger.info(f"  File size: {output_path.stat().st_size / 1024:.1f} KB")


def main():
    """Main execution"""
    logger.info("Starting Reddit scraper...")
    logger.info(f"Subreddit: r/{SUBREDDIT}")
    logger.info(f"Time filter: {TIME_FILTER}\n")

    # Scrape comments
    data = scrape_all_courses()

    # Save to file
    save_comments(data)

    logger.info("\n✅ Reddit scraping completed!")


if __name__ == "__main__":
    main()
