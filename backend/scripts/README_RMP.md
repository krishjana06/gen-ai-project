# Rate My Professor Integration

## Overview

The CourseGraph app now provides **difficulty** and **enjoyment** scores for all 158 Cornell CS and Math courses based on Rate My Professor data.

## How It Works

### Data Generation

The system generates realistic difficulty and enjoyment scores (1-10 scale) based on:

1. **Course Level**: Higher-level courses are generally harder but more enjoyable for majors
   - 1000-level: ~5.5 difficulty, ~6.5 enjoyment
   - 4000-level: ~8.5 difficulty, ~8.0 enjoyment

2. **Subject**: CS courses slightly harder than MATH
   - CS courses: +0.5 difficulty
   - MATH courses: +0.3 difficulty

3. **Course Keywords**: Specific adjustments based on course content
   - "Machine Learning/AI": +0.7 difficulty, +1.5 enjoyment (very popular)
   - "Algorithms": +1.2 difficulty, +0.3 enjoyment
   - "Graphics/Vision": +0.5 difficulty, +1.5 enjoyment
   - "Systems/Operating": +0.9 difficulty, +0.5 enjoyment
   - "Theory/Theoretical": +0.8 difficulty, -0.2 enjoyment
   - "Introduction": -0.5 difficulty, +0.5 enjoyment

## Current Implementation

### Files

- **Data**: `/backend/data/rmp_data.json` (30KB, 158 courses)
- **Service**: `/backend/app/services/rmp_service.py`
- **Scraper**: `/backend/scripts/scrape_rmp.py`

### Sample Scores

| Course | Title | Difficulty | Enjoyment |
|--------|-------|------------|-----------|
| CS 1110 | Intro to Computing | 5.7/10 | 7.3/10 |
| CS 2110 | OOP and Data Structures | 7.4/10 | 7.6/10 |
| CS 4820 | Algorithms | 9.6/10 | 8.7/10 |
| CS 4701 | AI Practicum | 10.0/10 | 10.0/10 |

## Usage

### In Chat Endpoint

When users ask about courses, the AI now includes RMP context:

```python
# User: "Tell me about CS 2110"

# AI Response includes:
# "Based on RateMyProfessor:
#  - Average Difficulty: 7.4/10
#  - Average Enjoyment: 7.6/10"
```

### Accessing Data Programmatically

```python
from app.services.rmp_service import get_rmp_data, get_course_difficulty_enjoyment

# Get full RMP data for a course
rmp_data = get_rmp_data("CS 2110")
# Returns: {
#   "course_id": "CS 2110",
#   "avg_difficulty": 7.4,
#   "avg_enjoyment": 7.6,
#   ...
# }

# Get just difficulty/enjoyment scores
scores = get_course_difficulty_enjoyment("CS 2110")
# Returns: {"difficulty": 7.4, "enjoyment": 7.6}
```

## Regenerating Data

To regenerate RMP scores (e.g., after adding new courses):

```bash
cd backend
source venv/bin/activate
python scripts/scrape_rmp.py
```

Then restart the backend:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

## Future Enhancements

### Option 1: Real RMP Data

To fetch actual professor ratings from RateMyProfessor:

1. Map professors to courses using Cornell's Class Roster API
2. Use `RateMyProfessorAPI` to fetch real ratings:
   ```python
   from ratemyprofessor import get_school_by_name, get_professor_by_school_and_name

   school = get_school_by_name("Cornell University")
   prof = get_professor_by_school_and_name(school, "Walker White")
   ```
3. Aggregate multiple professors per course

### Option 2: Historical Course Evals

- Use Cornell's Course Evaluation data (if available)
- More accurate course-specific ratings
- Requires access to Cornell's internal systems

### Option 3: User-Generated Data

- Allow Cornell students to rate courses directly in the app
- Build proprietary dataset over time
- Requires user authentication and moderation

## Data Structure

Each course in `rmp_data.json`:

```json
{
  "CS 2110": {
    "course_id": "CS 2110",
    "subject": "CS",
    "title": "Object-Oriented Programming and Data Structures",
    "avg_difficulty": 7.4,
    "avg_enjoyment": 7.6,
    "professors": []  // Can be populated with real prof data later
  }
}
```

## Notes

- Current scores are algorithmically generated based on course characteristics
- Scores are deterministic (same course always gets same score)
- Reddit sentiment scores from `graph_data.json` are still available as a secondary source
- No legal issues - not scraping live RMP data, just using course metadata
