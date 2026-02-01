# CourseGraph

**Interactive 3D prerequisite graph for Cornell CS & Math courses with AI-powered course advisor**

CourseGraph visualizes course prerequisites as an interactive 3D knowledge graph, enriched with student sentiment data from Reddit and RateMyProfessor ratings, powered by Google Gemini AI for intelligent course planning.

---

## Features

### Frontend
- **Cornell-themed UI** - Light, professional design using Cornell Red (#B31B1B) and institutional branding
- **3D Force Graph** - Interactive prerequisite visualization with ForceGraph3D and Three.js
- **Subway Timeline** - Semester-by-semester course planning view built with ReactFlow
- **AI Chat Interface** - Conversational course advisor with context-aware responses
- **Course Detail Modals** - Click any course node to see full details, prerequisites, and sentiment data
- **Graph Legend & Controls** - Filter by subject, zoom, and explore the prerequisite network

### Backend
- **Cornell API Scraper** - Fetches CS + Math courses with instructor data from Cornell's Class Roster API
- **Reddit Sentiment Analysis** - VADER NLP scoring for difficulty and enjoyment from r/Cornell
- **RateMyProfessor Integration** - Professor ratings scraped via RMP's GraphQL API, mapped to courses
- **NetworkX Graph** - Prerequisite dependency chains with sentiment-weighted nodes
- **FastAPI Backend** - REST API serving graph data and AI chat
- **Gemini AI Chat** - RAG-based course advisor that cites RMP ratings and Reddit sentiment in responses

---

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Gemini API key (for AI chat features)
- Reddit API credentials (optional, for sentiment analysis)

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run data pipeline
python3 scripts/scraper.py             # Fetch courses from Cornell API
python3 scripts/reddit_scraper.py      # Scrape Reddit sentiment (optional)
python3 scripts/sentiment_analyzer.py  # Generate sentiment scores
python3 scripts/build_graph.py         # Build prerequisite graph
python3 scripts/rmp_scraper.py         # Fetch RateMyProfessor ratings

# Start backend server
python3 -m uvicorn app.main:app --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Backend:** `http://localhost:8000`
**Frontend:** `http://localhost:3000`

### API Endpoints

```bash
# Health check
curl http://localhost:8000/

# Get course graph
curl http://localhost:8000/api/graph

# Chat with AI advisor
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What prerequisites do I need for CS 4820?"}'
```

---

## Project Structure

```
gen-ai-project/
├── backend/
│   ├── scripts/
│   │   ├── scraper.py              # Cornell API scraper (extracts instructors)
│   │   ├── reddit_scraper.py       # Reddit sentiment scraper
│   │   ├── sentiment_analyzer.py   # VADER NLP analysis
│   │   ├── build_graph.py          # NetworkX graph builder
│   │   └── rmp_scraper.py          # RateMyProfessor GraphQL scraper
│   ├── app/
│   │   ├── main.py                 # FastAPI application
│   │   ├── config/settings.py      # Environment config
│   │   ├── api/
│   │   │   ├── graph.py            # GET /api/graph
│   │   │   └── chat.py             # POST /api/chat (RAG with RMP + Reddit context)
│   │   └── services/
│   │       ├── gemini_service.py   # Gemini API wrapper
│   │       └── rmp_service.py      # RMP + Reddit data loader
│   ├── data/
│   │   ├── raw_courses.json        # Courses with instructor names
│   │   ├── reddit_comments.json    # Reddit comments
│   │   ├── sentiment_scores.json   # Difficulty/enjoyment scores
│   │   ├── graph_data.json         # Prerequisite graph
│   │   └── rmp_data.json           # RateMyProfessor ratings
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx          # Root layout (Cornell theme)
    │   │   ├── page.tsx            # Main page with view switching
    │   │   └── globals.css         # Cornell-themed styles
    │   ├── components/
    │   │   ├── graph/
    │   │   │   ├── CourseGraph3D.tsx    # 3D force graph visualization
    │   │   │   └── GraphLegend.tsx      # Subject legend
    │   │   ├── timeline/
    │   │   │   ├── TimelineView.tsx     # Semester timeline container
    │   │   │   ├── SubwayTimeline.tsx   # ReactFlow subway map
    │   │   │   ├── TimelineTabs.tsx     # Semester tab navigation
    │   │   │   └── CourseNode.tsx       # Custom course nodes
    │   │   ├── chat/
    │   │   │   ├── ChatInterface.tsx    # Full-page chat with Cornell branding
    │   │   │   ├── ChatOverlay.tsx      # Floating chat panel
    │   │   │   ├── ChatMessage.tsx      # Message bubbles
    │   │   │   └── ChatInput.tsx        # Input with send button
    │   │   ├── course/
    │   │   │   ├── CourseDetailModal.tsx # Course info modal
    │   │   │   └── VectorSphere3D.tsx   # Decorative 3D sphere
    │   │   └── panels/
    │   │       ├── CourseDetailsPanel.tsx # Side panel details
    │   │       └── MetricBar.tsx         # Score visualization bars
    │   ├── lib/
    │   │   └── colorSchemes.ts     # Cornell Red / dark gray palettes
    │   └── store/
    │       └── useStore.ts         # Zustand state management
    ├── public/
    │   └── cornell-logo.svg        # Cornell shield logo
    ├── tailwind.config.ts          # Cornell color palette
    └── package.json
```

---

## Configuration

### Environment Variables

Create `backend/.env` with:

```env
# Gemini API (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_key_here

# Reddit API (https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=CourseGraph:v1.0

# Backend config
CORS_ORIGINS=["http://localhost:3000"]
CORNELL_ROSTER_SEMESTER=FA25
```

**Note:** The app works without some API keys:
- **Without Gemini:** Chat returns a placeholder message
- **Without Reddit:** Uses neutral sentiment scores (5.0/10)
- **RMP data** is scraped independently (no API key needed)

---

## Data Pipeline

The backend uses a pre-scrape architecture — all external data is fetched upfront and stored as JSON, then loaded at runtime for fast responses.

```
Cornell Class Roster API  →  raw_courses.json (courses + instructors)
Reddit r/Cornell posts    →  reddit_comments.json → sentiment_scores.json
RMP GraphQL API           →  rmp_data.json (professor ratings)
                               ↓
                          graph_data.json (prerequisite graph with sentiment)
                               ↓
                    FastAPI serves graph + chat endpoints
                               ↓
              Chat injects RMP + Reddit context into Gemini prompt
```

### RateMyProfessor Integration

The RMP scraper uses RateMyProfessor's GraphQL API directly (the pip package's HTML scraping is broken due to 403 responses). It:

1. Reads instructor names from `raw_courses.json`
2. Searches each instructor at Cornell (school ID 298) via `NewSearchTeachersQuery`
3. Fetches full ratings via `RatingsListQuery`
4. Maps professor data back to course IDs

When a student asks about a course in chat, the AI response includes professor ratings and Reddit sentiment data naturally in its answer.

---

## Tech Stack

**Backend:**
- FastAPI - Python web framework
- NetworkX - Graph algorithms
- Google Gemini 2.5 Flash - AI chat and prerequisite parsing
- VADER / NLTK - Sentiment analysis
- PRAW - Reddit API
- Requests - RMP GraphQL API calls

**Frontend:**
- Next.js 14 - React framework
- react-force-graph-3d / Three.js - 3D visualization
- ReactFlow - Subway timeline view
- Tailwind CSS - Cornell-themed styling
- Framer Motion - Animations
- Zustand - State management

---

## License

MIT License

---

**Built for Cornell students by students**
