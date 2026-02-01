"""
Sentiment Analyzer for Course Reviews
Uses VADER sentiment analysis to generate difficulty and enjoyment scores
"""

import json
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from pathlib import Path
from typing import Dict
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Download VADER lexicon if not already present
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    logger.info("Downloading VADER lexicon...")
    nltk.download('vader_lexicon', quiet=True)

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "reddit_comments.json"
OUTPUT_FILE = DATA_DIR / "sentiment_scores.json"

# Keywords for difficulty detection
DIFFICULTY_KEYWORDS = {
    "hard": 1.5,
    "difficult": 1.5,
    "challenging": 1.3,
    "tough": 1.4,
    "impossible": 2.0,
    "brutal": 1.8,
    "easy": -1.5,
    "simple": -1.3,
    "manageable": -1.0,
    "straightforward": -1.2,
    "trivial": -1.5
}


def analyze_difficulty(text: str) -> float:
    """
    Analyze text for difficulty indicators

    Args:
        text: Comment text

    Returns:
        Difficulty score (-2 to +2, where +2 is very difficult)
    """
    text_lower = text.lower()
    score = 0.0
    count = 0

    for keyword, weight in DIFFICULTY_KEYWORDS.items():
        if keyword in text_lower:
            score += weight
            count += 1

    return score / count if count > 0 else 0.0


def analyze_sentiment(comments: list) -> Dict:
    """
    Analyze sentiment of comments for a course

    Args:
        comments: List of comment dictionaries

    Returns:
        Dictionary with difficulty_score, enjoyment_score, comment_count, confidence
    """
    if not comments:
        return {
            "difficulty": 5.0,  # Neutral
            "enjoyment": 5.0,   # Neutral
            "comment_count": 0,
            "confidence": "none"
        }

    sia = SentimentIntensityAnalyzer()

    # Analyze each comment
    difficulty_scores = []
    enjoyment_scores = []

    for comment in comments:
        text = comment.get('text', '')

        # Difficulty analysis
        diff_score = analyze_difficulty(text)
        if diff_score != 0:
            difficulty_scores.append(diff_score)

        # Enjoyment analysis (using VADER compound score)
        sentiment = sia.polarity_scores(text)
        enjoyment_scores.append(sentiment['compound'])

    # Calculate averages
    avg_difficulty = sum(difficulty_scores) / len(difficulty_scores) if difficulty_scores else 0.0
    avg_enjoyment = sum(enjoyment_scores) / len(enjoyment_scores) if enjoyment_scores else 0.0

    # Normalize to 0-10 scale
    # Difficulty: -2 to +2 → 0 to 10 (higher = more difficult)
    difficulty_normalized = max(0, min(10, (avg_difficulty + 2) * 2.5))

    # Enjoyment: -1 to +1 → 0 to 10 (higher = more enjoyable)
    enjoyment_normalized = max(0, min(10, (avg_enjoyment + 1) * 5))

    # Determine confidence
    comment_count = len(comments)
    if comment_count >= 10:
        confidence = "high"
    elif comment_count >= 3:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "difficulty": round(difficulty_normalized, 1),
        "enjoyment": round(enjoyment_normalized, 1),
        "comment_count": comment_count,
        "confidence": confidence
    }


def analyze_all_courses() -> Dict:
    """
    Analyze sentiment for all courses

    Returns:
        Dictionary mapping course IDs to sentiment scores
    """
    # Load Reddit comments
    if not INPUT_FILE.exists():
        logger.warning(f"{INPUT_FILE} not found - generating neutral scores for all courses")
        return {}

    with open(INPUT_FILE, 'r') as f:
        comments_data = json.load(f)

    logger.info(f"Loaded comments for {len(comments_data)} courses")

    # Analyze sentiment for each course
    sentiment_scores = {}

    for i, (course_id, comments) in enumerate(comments_data.items(), 1):
        logger.info(f"[{i}/{len(comments_data)}] Analyzing: {course_id} ({len(comments)} comments)")
        sentiment_scores[course_id] = analyze_sentiment(comments)

    logger.info(f"\n{'='*60}")
    logger.info(f"SUMMARY: Analyzed {len(sentiment_scores)} courses")
    logger.info(f"  - High confidence: {sum(1 for s in sentiment_scores.values() if s['confidence'] == 'high')}")
    logger.info(f"  - Medium confidence: {sum(1 for s in sentiment_scores.values() if s['confidence'] == 'medium')}")
    logger.info(f"  - Low confidence: {sum(1 for s in sentiment_scores.values() if s['confidence'] == 'low')}")
    logger.info(f"{'='*60}\n")

    return sentiment_scores


def save_scores(data: Dict, output_path: Path = OUTPUT_FILE):
    """Save sentiment scores to JSON file"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info(f"✓ Saved to {output_path}")
    logger.info(f"  File size: {output_path.stat().st_size / 1024:.1f} KB")


def main():
    """Main execution"""
    logger.info("Starting sentiment analysis...")

    # Analyze all courses
    scores = analyze_all_courses()

    # Save to file
    save_scores(scores)

    logger.info("\n✅ Sentiment analysis completed!")


if __name__ == "__main__":
    main()
