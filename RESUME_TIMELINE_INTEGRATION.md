# Resume-to-Timeline Integration Guide

## Overview

The CourseGraph app now supports **automatic timeline generation from resume uploads**. Users can upload their resume (PDF, DOCX, or TXT) and the system will:

1. Extract text and keywords from the resume
2. Identify skills, completed courses, career goals, and interests using AI
3. Automatically generate a personalized course timeline based on the extracted information

## How It Works

### User Flow

```
Upload Resume → AI Analysis → Extract Information → Generate Timeline → View Results
```

1. **Upload**: User uploads resume file (max 5MB)
2. **Parse**: AI extracts skills, courses, career goals, interests, and academic level
3. **Generate**: System automatically creates 3 personalized timeline paths
4. **Navigate**: User is redirected to timeline view with their personalized paths

### Technical Flow

```
Frontend (ResumeToTimelineForm)
    ↓
POST /api/upload-resume (Resume Parser)
    ↓
Extract: skills, courses, career_goal, interests, current_level
    ↓
POST /api/plan-timeline (Timeline Planner)
    ↓
Generate 3 timeline paths (theorist, engineer, balanced)
    ↓
Display in TimelineView
```

## Key Components

### 1. Enhanced Resume Parser

**Location**: `backend/app/services/resume_parser.py`

**New Fields Extracted**:
- `career_goal`: Inferred from resume (e.g., "Machine Learning Engineer")
- `interests`: Technical focus areas (e.g., ["AI/ML", "Web Development"])
- `current_level`: Academic standing (freshman, sophomore, junior, senior, graduate)

**Example Output**:
```json
{
  "skills": ["Python", "Java", "Machine Learning"],
  "courses": ["CS 2110", "MATH 2210"],
  "experience_years": 2,
  "summary": "Software engineer with ML background",
  "career_goal": "Machine Learning Engineer",
  "interests": ["AI/ML", "Computer Vision"],
  "current_level": "junior"
}
```

### 2. Resume-to-Timeline Component

**Location**: `frontend/src/components/forms/ResumeToTimelineForm.tsx`

**Features**:
- File upload with drag-and-drop
- Real-time progress indicators (parsing → generating)
- Display of extracted information
- Automatic timeline generation
- Navigation to timeline view
- Error handling

**States**:
- `uploading`: File is being uploaded
- `parsing`: Resume is being analyzed
- `generating`: Timeline is being created

### 3. Dedicated Resume Upload Page

**Location**: `frontend/src/app/resume/page.tsx`

**URL**: `http://localhost:3000/resume`

**Includes**:
- Full-page resume upload interface
- Benefits section explaining advantages
- FAQ section for common questions
- Link back to manual planning

### 4. Integration with Main Page

**Location**: `frontend/src/components/chat/ChatInterface.tsx`

**Changes**:
- Added prominent "Upload Your Resume Instead" button
- Links to `/resume` page
- Divider separating resume upload from manual input
- Maintains existing manual planning functionality

## API Endpoints

### Upload Resume
```
POST /api/upload-resume
Content-Type: multipart/form-data

Response:
{
  "skills": [...],
  "courses": [...],
  "career_goal": "...",
  "interests": [...],
  "current_level": "...",
  "experience_years": 0,
  "summary": "..."
}
```

### Generate Timeline (Enhanced)
```
POST /api/plan-timeline
Content-Type: application/json

{
  "career_goal": "Machine Learning Engineer. Interested in: AI/ML, Computer Vision",
  "completed_courses": ["CS 2110", "MATH 2210"],
  "current_semester": "Junior Fall",
  "resume_data": { /* optional: full resume analysis */ }
}

Response:
{
  "analysis": {...},
  "paths": {
    "theorist": {...},
    "engineer": {...},
    "balanced": {...}
  }
}
```

## Academic Level to Semester Mapping

The system automatically maps academic levels to appropriate semesters:

| Academic Level | Starting Semester |
|---------------|------------------|
| Freshman      | Freshman Spring  |
| Sophomore     | Sophomore Fall   |
| Junior        | Junior Fall      |
| Senior        | Senior Fall      |
| Graduate      | Graduate Fall    |

## Career Goal Enrichment

When generating timelines, the system enriches the career goal with interests:

**Original Career Goal**: "Machine Learning Engineer"

**Enriched**: "Machine Learning Engineer. Interested in: AI/ML, Computer Vision, Deep Learning"

This helps the AI generate more targeted course recommendations.

## Usage Instructions

### For Users

1. Navigate to the homepage or click "Upload Your Resume Instead"
2. Upload your resume (PDF, DOCX, or TXT)
3. Click "Generate My Timeline"
4. Wait for AI analysis (usually 10-15 seconds)
5. View your personalized timeline paths

### For Developers

**Testing the Flow**:

```bash
# Start backend
cd backend
python -m uvicorn app.main:app --reload

# Start frontend (in another terminal)
cd frontend
npm run dev

# Navigate to:
http://localhost:3000/resume
```

**Sample Resume for Testing**:
Create a text file with:
```
John Doe
Cornell University, Computer Science

Objective: Aspiring Machine Learning Engineer

Education:
- Junior, Computer Science Major
- Completed: CS 1110, CS 2110, MATH 2210

Skills:
- Python, Java, TensorFlow
- Machine Learning, Data Structures

Projects:
- Image Classification with CNNs
- Web Scraper in Python

Interests: AI/ML, Computer Vision, Deep Learning
```

## Benefits of Resume-Based Planning

### For Students
- ✅ **Faster**: No manual data entry
- ✅ **Accurate**: AI extracts all relevant information
- ✅ **Personalized**: Based on actual background, not assumptions
- ✅ **Convenient**: Single file upload vs. typing everything

### For Career Planning
- ✅ **Holistic**: Considers skills, experience, and goals together
- ✅ **Aligned**: Timeline matches career objectives from resume
- ✅ **Comprehensive**: Leverages all resume information

## Privacy & Security

- ✅ Resumes are processed in memory only
- ✅ Files are immediately deleted after processing
- ✅ Only extracted data (skills, courses) is used
- ✅ No permanent storage of resume files
- ✅ No sharing with third parties

## Error Handling

The system handles various error cases:

1. **Invalid File Type**: Clear message requesting PDF/DOCX/TXT
2. **File Too Large**: Warning if file exceeds 5MB
3. **Parsing Failure**: Fallback to basic extraction
4. **No Career Goal**: Manual specification option
5. **Network Error**: Retry mechanism with clear feedback

## Future Enhancements

Potential improvements:
- [ ] Resume storage for registered users
- [ ] Manual editing of extracted information
- [ ] Support for more file formats (ODT, RTF)
- [ ] Batch processing for multiple resumes
- [ ] Integration with LinkedIn profiles
- [ ] Resume quality scoring and suggestions

## Troubleshooting

### Resume not parsing correctly?
- Ensure resume is well-structured with clear sections
- Use standard section headers (Education, Skills, Experience)
- Include Cornell course codes in standard format (CS 2110)

### Timeline not generating?
- Check that career goal was extracted
- Verify completed courses are in correct format
- Ensure backend is running and accessible

### Skills not detected?
- Use common technology names (Python, Java, not "Py", "J")
- List skills in a dedicated "Skills" section
- Include both languages and frameworks

## File Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── resume.py              # Resume upload endpoint
│   │   └── timeline.py            # Enhanced timeline API
│   └── services/
│       └── resume_parser.py       # Enhanced parser with career goals

frontend/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   └── ChatInterface.tsx  # Added resume upload link
│   │   └── forms/
│   │       └── ResumeToTimelineForm.tsx  # Integrated component
│   └── app/
│       └── resume/
│           └── page.tsx           # Dedicated resume page
```

## Summary

The resume-to-timeline integration provides a seamless, intelligent way for students to get personalized course recommendations without manual data entry. By leveraging AI to extract and analyze resume content, the system creates highly relevant timelines that align with each student's unique background and career aspirations.

---

**Questions or Issues?** Check the main [NEW_FEATURES.md](./NEW_FEATURES.md) or open an issue in the repository.
