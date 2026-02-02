# Career Compass 🎓

Cornell CS & Math course planning tool powered by AI.

## Quick Start

### Run Everything with One Command

```bash
# Install dependencies (first time only)
npm run install:all

# Run both backend + frontend
npm run dev
```

That's it! Your app will be running:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Available Commands

```bash
npm run dev              # Run both servers
npm run backend          # Run only backend
npm run frontend         # Run only frontend
npm run kill             # Stop all servers

npm run install:all      # Install all dependencies
npm run install:backend  # Install Python packages
npm run install:frontend # Install npm packages
```

## Setup (First Time)

1. **Add OpenAI API Key**
   ```bash
   cd backend
   # Edit .env and add your OPENAI_API_KEY
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Start Developing**
   ```bash
   npm run dev
   ```

## Features

- 🤖 AI-powered course timeline generation
- 📊 Difficulty & enjoyment ratings for 158 courses
- 💬 Intelligent chat advisor
- 🗺️ Interactive timeline visualization
- 🎯 Career-focused recommendations

## Tech Stack

- **Backend**: FastAPI (Python), OpenAI API
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: GPT-4o-mini for timelines and chat

Built with Claude Code ⚡
