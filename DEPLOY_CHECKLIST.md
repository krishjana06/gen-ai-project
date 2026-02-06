# Quick Deployment Checklist ✅

## Before You Start
- [ ] Code is working locally
- [ ] `.env` files are in `.gitignore`
- [ ] You have your OpenAI API key ready

## Deploy Backend (Render)
- [ ] Create Render account
- [ ] Create new Web Service
- [ ] Connect GitHub repo
- [ ] Set Root Directory: `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Add env var: `OPENAI_API_KEY`
- [ ] Deploy and wait (5-10 min)
- [ ] Test: Visit `/api/graph` endpoint
- [ ] Copy backend URL

## Deploy Frontend (Vercel)
- [ ] Create Vercel account
- [ ] Import GitHub repo
- [ ] Set Root Directory: `frontend`
- [ ] Add env var: `NEXT_PUBLIC_API_URL` (use Render backend URL)
- [ ] Deploy and wait (2-3 min)
- [ ] Copy frontend URL

## Update CORS
- [ ] Go to Render dashboard
- [ ] Add env var: `CORS_ORIGINS` with Vercel URL
- [ ] Save and redeploy

## Test Live App
- [ ] Visit Vercel URL
- [ ] Generate a timeline
- [ ] Click on a course
- [ ] Upload a resume
- [ ] Everything works!

## Optional
- [ ] Set up custom domain
- [ ] Enable Vercel authentication
- [ ] Set up uptime monitor (uptimerobot.com)

---

**Total Time: ~20 minutes**
**Total Cost: $0/month**
