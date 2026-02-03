# Complete Setup Guide 🚀

## Database Setup

**Good news: No database required!**

Your app uses JSON files for data storage:
- `backend/data/graph_data.json` - Course graph (✅ already exists)
- `backend/data/rmp_data.json` - RMP scores (✅ already exists)
- `backend/data/raw_courses.json` - Raw course data (✅ already exists)

No PostgreSQL, MySQL, or MongoDB needed!

## API Keys Required

### 1. OpenAI API Key (REQUIRED) ✅

Your app uses OpenAI for:
- Timeline generation (3 career paths)
- Chat advisor responses

**How to get it:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

**How to add it:**
```bash
cd backend
nano .env  # or use any text editor
```

Add this line:
```env
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
```

**Cost:** ~$0.01-0.05 per timeline generation with GPT-4o-mini

### 2. Reddit API (OPTIONAL) ❌

**Current Status:** Not actively used

The app has Reddit API placeholders in `.env`, but:
- You already have pre-computed Reddit sentiment scores in `graph_data.json`
- Live Reddit scraping would violate their AI usage terms
- You can safely ignore these for now

If you want to add it anyway:
1. Go to https://www.reddit.com/prefs/apps
2. Create a "script" app
3. Add to `.env`:
```env
REDDIT_CLIENT_ID=your_id_here
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_USER_AGENT=CourseGraph:v1.0 (by /u/your_username)
```

### 3. Rate My Professor (NOT NEEDED) ❌

Your app generates RMP scores algorithmically - no API key needed!

The `RateMyProfessorAPI` Python package is installed but only used for the data structure, not for live scraping.

---

## Complete First-Time Setup

### Prerequisites

Check you have these installed:

```bash
# Python 3.12 or higher
python --version
# Should output: Python 3.12.x

# Node.js 18 or higher
node --version
# Should output: v18.x.x or higher

# npm
npm --version
# Should output: 8.x.x or higher
```

If you don't have them:
- **Python**: https://www.python.org/downloads/
- **Node.js**: https://nodejs.org/ (includes npm)

### Step-by-Step Setup

```bash
# 1. Navigate to project
cd /Users/krishjana/Desktop/gen-ai-project

# 2. Install ALL dependencies (backend + frontend)
npm run install:all

# This runs:
# - cd backend && pip install -r requirements.txt
# - cd frontend && npm install

# 3. Add OpenAI API Key
cd backend
nano .env

# Add your key:
# OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE

# 4. Return to root and start everything
cd ..
npm run dev

# ✅ Done! Both servers will start
```

Your app will be running at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

---

## Verify Everything is Working

### 1. Check Backend API
```bash
curl http://localhost:8000/api/graph | jq '.nodes | length'
# Should output: 158
```

### 2. Check RMP Scores
```bash
curl http://localhost:8000/api/graph | jq '.nodes[0] | {id, difficulty_score, enjoyment_score}'
# Should show course with scores (not 5.0)
```

### 3. Test Chat (requires OpenAI key)
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about CS 2110", "history": []}'
# Should get AI response with course info
```

### 4. Test Frontend
Open http://localhost:3000 in browser
- Should see Cornell logo and CourseGraph interface
- Click a suggested prompt and generate timeline
- Click on a course to see difficulty/enjoyment scores

---

## Configuration Files

### Backend `.env`
```env
# REQUIRED
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE

# OPTIONAL (not currently used)
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USER_AGENT=CourseGraph:v1.0 (by /u/your_username)

# Configuration (already set)
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
CORNELL_ROSTER_SEMESTER=FA25
```

### Frontend `.env.local`
**Not needed!** Frontend auto-connects to `http://localhost:8000`

(Optional) If you want to change the backend URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Data Files Included

All data files are already in `backend/data/`:

| File | Size | Description | Status |
|------|------|-------------|--------|
| `graph_data.json` | ~130KB | Course graph with Reddit scores | ✅ Exists |
| `rmp_data.json` | ~30KB | RMP difficulty/enjoyment scores | ✅ Exists |
| `raw_courses.json` | ~110KB | Raw Cornell course catalog | ✅ Exists |

No need to download or generate anything!

---

## Regenerating Data (Optional)

### Regenerate RMP Scores
If you want to update RMP scores with new logic:

```bash
cd backend
source venv/bin/activate
python scripts/scrape_rmp.py

# Restart backend to load new data
cd ..
npm run kill
npm run dev
```

### Update Course Data
To fetch latest Cornell courses (requires Cornell Roster API):

```bash
cd backend
source venv/bin/activate
python scripts/fetch_cornell_courses.py  # If this script exists

# Then rebuild graph
python scripts/build_graph.py  # If this script exists

# Then regenerate RMP
python scripts/scrape_rmp.py
```

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'app'"

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "OpenAI API key not configured"

Check your `backend/.env` file has:
```env
OPENAI_API_KEY=sk-proj-...your-key...
```

No quotes, no spaces around `=`

### "Port 8000 already in use"

```bash
npm run kill
# Or manually:
lsof -ti:8000 | xargs kill
```

### "npm: command not found"

Install Node.js from https://nodejs.org/

### Frontend showing "Failed to generate timeline"

1. Check backend is running: `curl http://localhost:8000`
2. Check OpenAI key is set in `backend/.env`
3. Check backend logs for errors

---

## Environment Variables Summary

| Variable | Required? | Default | Purpose |
|----------|-----------|---------|---------|
| `OPENAI_API_KEY` | ✅ YES | - | AI timeline & chat generation |
| `REDDIT_CLIENT_ID` | ❌ No | - | Reddit API (not used) |
| `REDDIT_CLIENT_SECRET` | ❌ No | - | Reddit API (not used) |
| `REDDIT_USER_AGENT` | ❌ No | CourseGraph:v1.0 | Reddit API (not used) |
| `CORS_ORIGINS` | ❌ No | localhost:3000 | Allowed frontend origins |
| `CORNELL_ROSTER_SEMESTER` | ❌ No | FA25 | Cornell API semester |

**Only OPENAI_API_KEY is required!**

---

## Security Notes

1. **Never commit `.env` to git** - it contains your API key
2. `.env` is already in `.gitignore`
3. Don't share your OpenAI key publicly
4. Rotate your key if it's exposed

---

## What's Next?

You're all set! To use the app:

```bash
npm run dev
```

Then:
1. Visit http://localhost:3000
2. Enter a career goal like "I want to work at Google on ML"
3. Optionally add completed courses: "CS 2110, MATH 1920"
4. Click "Generate My Timeline Paths"
5. Explore the 3 different paths
6. Click on courses to see difficulty and enjoyment ratings
7. Use the chat to ask about courses

---

## Quick Reference

```bash
# Start everything
npm run dev

# Stop everything
npm run kill

# Install dependencies
npm run install:all

# Run only backend
npm run backend

# Run only frontend
npm run frontend
```

That's it! No database, just one API key. 🎉
