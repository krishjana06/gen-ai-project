# New Features Documentation

This document describes the three new features added to Career Compass: Resume Upload, Job Description Matcher, and Study Materials Cards.

## Table of Contents

1. [Resume Upload Feature](#1-resume-upload-feature)
2. [Job Description Matcher](#2-job-description-matcher)
3. [Study Materials Cards](#3-study-materials-cards)
4. [Installation & Setup](#installation--setup)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)

---

## 1. Resume Upload Feature

### Overview
The Resume Upload feature allows users to upload their resumes (PDF, DOCX, or TXT) and automatically extract:
- Technical skills
- Relevant courses taken
- Years of experience
- Professional summary

### Frontend Component
**Location:** `frontend/src/components/forms/ResumeUploadForm.tsx`

**Features:**
- Drag-and-drop file upload
- File validation (type and size)
- Real-time parsing feedback
- Display of extracted information
- Skill and course badges

**Props:**
```typescript
interface ResumeUploadFormProps {
  onUploadSuccess?: (data: any) => void;
  className?: string;
}
```

### Backend Service
**Location:** `backend/app/services/resume_parser.py`

**Capabilities:**
- PDF text extraction (PyPDF2)
- DOCX text extraction (python-docx)
- Plain text processing
- AI-powered skill extraction using OpenAI GPT-4o-mini
- Course code pattern matching (CS/MATH XXXX)
- Experience estimation

### State Management
**Location:** `frontend/src/stores/resumeStore.ts`

**Store Interface:**
```typescript
interface ResumeStore {
  resumeData: ResumeData | null;
  isUploading: boolean;
  error: string | null;
  setResumeData: (data: ResumeData) => void;
  setIsUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
```

---

## 2. Job Description Matcher

### Overview
The Job Description Matcher analyzes job postings and recommends Cornell CS/Math courses that align with the required skills.

### Frontend Component
**Location:** `frontend/src/components/matcher/JobMatcher.tsx`

**Features:**
- Textarea for job description input
- AI-powered matching analysis
- Overall match score (0-100%)
- Ranked course recommendations with relevance scores
- Suggested learning paths
- Skill gap identification

**Match Result Interface:**
```typescript
interface JobMatchResult {
  matched_courses: {
    code: string;
    title: string;
    relevance_score: number;  // 0.0 to 1.0
    reason: string;
  }[];
  recommended_paths: {
    path_name: string;
    courses: string[];
    description: string;
  }[];
  skill_gaps: string[];
  overall_match_score: number;  // 0 to 100
}
```

### Backend Service
**Location:** `backend/app/services/job_matcher.py`

**Capabilities:**
- Job description parsing
- Skill extraction from job requirements
- Course database matching (18+ courses)
- AI-powered relevance scoring
- Learning path generation
- Skill gap analysis

**Course Database:**
Includes courses like:
- CS 2110: OOP and Data Structures
- CS 4780: Machine Learning
- CS 5430: System Security
- MATH 2210: Linear Algebra
- And more...

---

## 3. Study Materials Cards

### Overview
Study Materials Cards provide curated learning resources for each Cornell CS/Math course, including videos, articles, practice problems, documentation, and books.

### Frontend Component
**Location:** `frontend/src/components/materials/StudyMaterialCard.tsx`

**Features:**
- Dynamic material loading per course
- Filter by resource type (video, article, practice, etc.)
- Filter by difficulty level (beginner, intermediate, advanced)
- Clickable resource cards with external links
- Duration indicators
- Loading and error states

**Props:**
```typescript
interface StudyMaterialCardProps {
  courseCode: string;  // e.g., "CS2110" or "CS 2110"
  className?: string;
}
```

**Material Interface:**
```typescript
interface StudyMaterial {
  title: string;
  type: 'video' | 'article' | 'practice' | 'documentation' | 'book';
  url: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;  // e.g., "2 hours", "30 min"
}
```

### Backend Service
**Location:** `backend/app/services/materials_service.py`

**Capabilities:**
- AI-generated study resources using OpenAI
- 6-12 diverse resources per course
- Mix of free and accessible materials
- Difficulty level classification
- Fallback materials for error cases

---

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

New dependencies added:
- `PyPDF2==3.0.1` - PDF parsing
- `python-docx==1.1.0` - DOCX parsing
- `python-multipart==0.0.6` - File upload support

### 2. Environment Variables

Ensure your `.env` file includes:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start Backend Server

```bash
cd backend
python -m uvicorn app.main:app --reload
```

Server will run on: `http://localhost:8000`

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## API Endpoints

### Resume Upload

**POST** `/api/upload-resume`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: File upload (field name: `file`)

**Response:**
```json
{
  "skills": ["Python", "Machine Learning", "Java"],
  "courses": ["CS 2110", "CS 4780"],
  "experience_years": 2,
  "summary": "Software engineer with ML background",
  "raw_text": "First 500 characters of resume..."
}
```

**Validation:**
- File types: PDF, DOCX, TXT
- Max size: 5MB
- Required: File field

---

### Job Description Matcher

**POST** `/api/match-job`

**Request:**
```json
{
  "job_description": "Full job description text..."
}
```

**Response:**
```json
{
  "matched_courses": [
    {
      "code": "CS 4780",
      "title": "Machine Learning",
      "relevance_score": 0.95,
      "reason": "Direct match for ML requirements"
    }
  ],
  "recommended_paths": [
    {
      "path_name": "ML Engineer Path",
      "courses": ["CS 2110", "CS 4780", "MATH 2210"],
      "description": "Foundation for ML engineering roles"
    }
  ],
  "skill_gaps": ["Docker", "Kubernetes"],
  "overall_match_score": 85
}
```

---

### Study Materials

**GET** `/api/study-materials/{course_code}`

**Parameters:**
- `course_code`: Course code (e.g., "CS2110", "CS 2110", "MATH2210")

**Response:**
```json
{
  "course_code": "CS 2110",
  "course_title": "Object-Oriented Programming and Data Structures",
  "materials": [
    {
      "title": "Java Programming Tutorial",
      "type": "video",
      "url": "https://youtube.com/...",
      "description": "Comprehensive Java tutorial",
      "difficulty": "beginner",
      "duration": "3 hours"
    },
    {
      "title": "Data Structures Visualizations",
      "type": "practice",
      "url": "https://visualgo.net",
      "description": "Interactive DS visualizations",
      "difficulty": "intermediate"
    }
  ]
}
```

---

## Usage Examples

### Using Resume Upload Component

```tsx
import ResumeUploadForm from '@/components/forms/ResumeUploadForm';

function MyPage() {
  const handleUploadSuccess = (data) => {
    console.log('Skills:', data.skills);
    console.log('Courses:', data.courses);
    // Use data for personalized recommendations
  };

  return (
    <ResumeUploadForm onUploadSuccess={handleUploadSuccess} />
  );
}
```

### Using Job Matcher Component

```tsx
import JobMatcher from '@/components/matcher/JobMatcher';

function CareerPage() {
  return (
    <div>
      <h1>Find Your Perfect Courses</h1>
      <JobMatcher />
    </div>
  );
}
```

### Using Study Materials Card

```tsx
import StudyMaterialCard from '@/components/materials/StudyMaterialCard';

function CoursePage() {
  return (
    <div>
      <h1>CS 2110 Resources</h1>
      <StudyMaterialCard courseCode="CS2110" />
    </div>
  );
}
```

### Complete Example Page

A complete integration example is available at:
**`frontend/src/app/features/page.tsx`**

Access it at: `http://localhost:3000/features`

This page demonstrates:
- All three features in tabbed interface
- How to switch between features
- Best practices for UI/UX
- Responsive layout examples

---

## File Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── resume.py                 # Resume upload endpoint
│   │   ├── job_matcher.py            # Job matching endpoint
│   │   └── study_materials.py        # Study materials endpoint
│   └── services/
│       ├── resume_parser.py          # Resume parsing logic
│       ├── job_matcher.py            # Job matching logic
│       └── materials_service.py      # Materials generation logic

frontend/
├── src/
│   ├── components/
│   │   ├── forms/
│   │   │   └── ResumeUploadForm.tsx  # Resume upload UI
│   │   ├── matcher/
│   │   │   └── JobMatcher.tsx        # Job matcher UI
│   │   └── materials/
│   │       └── StudyMaterialCard.tsx # Study materials UI
│   ├── stores/
│   │   └── resumeStore.ts            # Resume state management
│   └── app/
│       └── features/
│           └── page.tsx              # Demo page
```

---

## Testing

### Test Resume Upload

1. Navigate to `http://localhost:3000/features`
2. Click "Resume Upload" tab
3. Upload a sample resume (PDF/DOCX/TXT)
4. Verify extracted skills and courses

### Test Job Matcher

1. Navigate to `http://localhost:3000/features`
2. Click "Job Matcher" tab
3. Paste a job description (e.g., from LinkedIn)
4. Click "Analyze Job Match"
5. Review recommended courses and match score

### Test Study Materials

1. Navigate to `http://localhost:3000/features`
2. Click "Study Materials" tab
3. Select a course from the sidebar
4. Browse materials and filter by type/difficulty
5. Click materials to open external resources

---

## Notes

- All features use OpenAI GPT-4o-mini for AI analysis
- Resume files are processed in memory and not stored permanently
- Study materials are generated on-demand and may vary
- Job matching uses a subset of Cornell CS/Math courses
- All components follow the existing Career Compass design system

---

## Future Enhancements

Potential improvements:
1. Resume storage and profile management
2. Expanded course database with all Cornell courses
3. Integration with existing timeline planner
4. Material caching for faster loads
5. User ratings for study materials
6. Save job matches and comparisons
7. Export course recommendations as PDF

---

For questions or issues, please refer to the main project README or contact the development team.
