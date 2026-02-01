# CourseGraph 📚

**Interactive 3D prerequisite graph for Cornell CS & Math courses with AI-powered course advisor**

CourseGraph visualizes course prerequisites as an interactive 3D knowledge graph, enriched with student sentiment data from Reddit and powered by Google Gemini AI for intelligent course planning.

---

## 🎯 Features

### Currently Implemented (MVP)
- ✅ **Cornell API Scraper** - Fetches 158 CS + Math courses
- ✅ **Reddit Sentiment Analysis** - VADER NLP for difficulty & enjoyment scores
- ✅ **NetworkX Graph** - Prerequisite chains with 158 nodes
- ✅ **FastAPI Backend** - `/api/graph` and `/api/chat` endpoints
- ✅ **Gemini AI Integration** - Prerequisite parsing & course advisor chatbot

### Coming Soon
- 🚧 **3D Visualization** - ForceGraph3D with sentiment-based styling
- 🚧 **Interactive Chat** - RAG-based course planning assistant
- 🚧 **Course Details Panel** - Click nodes to see sentiment data

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Gemini API key (optional, for AI features)
- Reddit API credentials (optional, for sentiment analysis)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys (optional)

# Run data pipeline (uses regex fallback without API keys)
python scripts/scraper.py          # Fetch courses (2 seconds)
python scripts/reddit_scraper.py   # Scrape Reddit (optional, requires API key)
python scripts/sentiment_analyzer.py  # Generate sentiment scores
python scripts/build_graph.py      # Build NetworkX graph

# Start backend server
python -m uvicorn app.main:app --port 8000
```

**Backend will be available at:** `http://localhost:8000`

### API Endpoints

```bash
# Health check
curl http://localhost:8000/

# Get course graph (158 CS + Math courses)
curl http://localhost:8000/api/graph

# Chat with AI advisor (requires Gemini API key)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What prerequisites do I need for CS 4820?"}'
```

---

## 📁 Project Structure

```
coursegraph/
├── backend/
│   ├── scripts/
│   │   ├── scraper.py              # Cornell API scraper ✅
│   │   ├── reddit_scraper.py       # Reddit sentiment scraper ✅
│   │   ├── sentiment_analyzer.py   # VADER NLP analysis ✅
│   │   └── build_graph.py          # NetworkX graph builder ✅
│   ├── app/
│   │   ├── main.py                 # FastAPI application ✅
│   │   ├── config/settings.py      # Environment config ✅
│   │   ├── api/
│   │   │   ├── graph.py            # GET /api/graph ✅
│   │   │   └── chat.py             # POST /api/chat ✅
│   │   └── services/
│   │       └── gemini_service.py   # Gemini API wrapper ✅
│   ├── data/
│   │   ├── raw_courses.json        # 158 courses (generated) ✅
│   │   ├── reddit_comments.json    # Sentiment data (optional)
│   │   ├── sentiment_scores.json   # Difficulty/enjoyment scores
│   │   └── graph_data.json         # NetworkX graph ✅
│   └── requirements.txt            # Python dependencies ✅
│
└── frontend/                       # Next.js app (🚧 coming soon)
    └── (To be implemented)
```

---

## 🔧 Configuration

### Environment Variables

Create `backend/.env` with:

```env
# Gemini API (get from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_key_here

# Reddit API (create app at https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=CourseGraph:v1.0

# Backend config
CORS_ORIGINS=["http://localhost:3000"]
CORNELL_ROSTER_SEMESTER=FA25
```

**Note:** The app works without API keys using fallback methods:
- **Without Gemini:** Uses regex for prerequisite parsing
- **Without Reddit:** Uses neutral sentiment scores (5.0/10)

---

## 📊 Current Status

**Data Pipeline:** ✅ Complete
- Scraped **158 courses** (97 CS + 61 MATH)
- Graph built with 158 nodes
- Ready for visualization

**Backend API:** ✅ Running
- FastAPI server operational
- Graph endpoint serving data
- Chat endpoint ready (needs Gemini key)

**Frontend:** 🚧 In Progress
- Next.js setup needed
- 3D visualization planned
- UI components designed

---

## 🧪 Testing

```bash
# Test scraper
cd backend
python scripts/scraper.py

# Verify graph data
ls -lh data/
# Should see: raw_courses.json (~105 KB), graph_data.json (~125 KB)

# Test API
curl http://localhost:8000/api/graph | jq '.nodes | length'
# Expected: 158
```

---

## 🛣️ Roadmap

- [x] Cornell API scraper
- [x] Reddit sentiment analysis
- [x] NetworkX graph builder
- [x] FastAPI backend
- [x] Gemini AI integration
- [ ] Next.js frontend
- [ ] 3D ForceGraph visualization
- [ ] Interactive chat UI
- [ ] Course details panel
- [ ] Sentiment-based node styling
- [ ] RAG enhancement for chat

---

## 📝 Tech Stack

**Backend:**
- FastAPI (Python web framework)
- NetworkX (graph algorithms)
- Google Gemini AI (prerequisite parsing & chat)
- VADER (sentiment analysis)
- PRAW (Reddit API)

**Frontend (Planned):**
- Next.js 14 (React framework)
- react-force-graph-3d (3D visualization)
- Tailwind CSS (styling)
- Axios (API client)

---

## 🤝 Contributing

This is a Cornell-specific educational project. Contributions welcome!

---

## 📄 License

MIT License

---

**Built for Cornell students by students** 🎓
