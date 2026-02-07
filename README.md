# CourseGraph 🎓

AI-powered Cornell CS & Math course planning tool that generates personalized academic timelines based on your career goals.

## 🚀 Live Demo

**Try it now:** [https://gen-ai-project-gamma.vercel.app](https://gen-ai-project-gamma.vercel.app)

---

## ✨ Features

- 🤖 **AI Timeline Generation** - Get 3 personalized course paths (Theorist, Engineer, Balanced) tailored to your career goals
- 📊 **Data-Driven Insights** - Difficulty and enjoyment ratings for 158 Cornell CS & MATH courses
- 💬 **Intelligent Chat Advisor** - Ask questions about courses, prerequisites, and career paths
- 🗺️ **Interactive Timeline Visualization** - Visual course planning with prerequisite tracking
- 🎯 **Career-Focused Recommendations** - Paths optimized for PhD research, industry, or versatile roles
- 📚 **Study Materials** - Curated learning resources for each course in your timeline

---

## 🏗️ Architecture

### Deployment
- **Frontend:** [Vercel](https://vercel.com) - Global CDN, automatic deployments
- **Backend:** [Render](https://render.com) - Persistent API server with auto-scaling

### Tech Stack
- **Frontend:** Next.js 14, TypeScript, React, Tailwind CSS, Three.js (3D visualizations)
- **Backend:** FastAPI (Python), OpenAI GPT-4o-mini
- **Data:** 158 courses from Cornell Course Roster API + Rate My Professors sentiment analysis

### API Endpoints
- `GET /api/graph` - Course graph with 158 nodes and prerequisite links
- `POST /api/plan-timeline` - Generate 3 personalized timeline paths
- `POST /api/chat` - Conversational course advisor
- `GET /api/study-materials/{course_code}` - Curated learning resources

---

## 🛠️ Local Development

Want to run this project locally? Follow these steps:

### Prerequisites
- Python 3.12+
- Node.js 18+
- OpenAI API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/krishjana06/gen-ai-project.git
   cd gen-ai-project
   ```

2. **Set up environment variables**

   Create `backend/.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   ```

   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Install dependencies**
   ```bash
   npm run install:all
   ```

4. **Run the development servers**
   ```bash
   npm run dev
   ```

   The app will be running at:
   - **Frontend:** http://localhost:3000
   - **Backend:** http://localhost:8000

### Available Commands

```bash
npm run dev              # Run both frontend and backend
npm run backend          # Run only backend (FastAPI)
npm run frontend         # Run only frontend (Next.js)
npm run kill             # Stop all servers

npm run install:all      # Install all dependencies
npm run install:backend  # Install Python packages
npm run install:frontend # Install npm packages
```

---

## 📊 Data Pipeline

1. **Course Data Collection**
   - Cornell Course Roster API (158 CS & MATH courses)
   - Prerequisite mapping from course catalog

2. **Sentiment Analysis**
   - Rate My Professors reviews via Reddit API
   - Difficulty and enjoyment scores (1-10 scale)

3. **AI Timeline Generation**
   - OpenAI GPT-4o-mini with custom prompts
   - Prerequisite-aware course sequencing
   - Career-goal optimization

---

## 🎯 Use Cases

**For Students:**
- Plan your academic journey from sophomore to senior year
- Explore different career paths (PhD vs Industry)
- Discover courses aligned with your interests
- Understand prerequisite chains

**For Advisors:**
- Quick timeline generation for advising sessions
- Data-backed course recommendations
- Visualize prerequisite dependencies

---

## 🚀 Deployment

This project is deployed using modern cloud platforms:

- **Frontend (Vercel):**
  - Automatic deployments on push to `main`
  - Global CDN for fast load times worldwide
  - Environment variable: `NEXT_PUBLIC_API_URL`

- **Backend (Render):**
  - Automatic deployments on push to `main`
  - Free tier with 750 hours/month
  - Environment variables: `OPENAI_API_KEY`, `CORS_ORIGINS`

### Deploy Your Own

**Frontend (Vercel):**
1. Fork this repository
2. Connect to Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com`
4. Deploy!

**Backend (Render):**
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && pip install -r requirements.txt`
4. Set start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (see `.env.example`)
6. Deploy!

---

## 📝 Project Structure

```
gen-ai-project/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI endpoints
│   │   ├── services/     # Business logic (timeline planner, chat)
│   │   └── main.py       # FastAPI app entry point
│   ├── data/             # Course data JSON files
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client, utilities
│   │   └── stores/       # State management (Zustand)
│   └── package.json
└── README.md
```

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Feel free to:
- Open an issue for bugs or feature requests
- Submit pull requests with improvements
- Share feedback on the deployed app

---

## 📄 License

MIT License - feel free to use this code for your own projects!

---

## 🙏 Acknowledgments

- **Cornell University** - Course data from official roster
- **OpenAI** - GPT-4o-mini for AI-powered features
- **Rate My Professors** - Community sentiment data
- Built with **[Claude Code](https://claude.ai/claude-code)** ⚡

---

**Live Demo:** [https://gen-ai-project-gamma.vercel.app](https://gen-ai-project-gamma.vercel.app)
