# CourseGraph Deployment Guide 🚀

Deploy CourseGraph for **FREE** using Vercel (frontend) and Render (backend).

---

## Architecture

```
Frontend (Next.js) → Vercel
Backend (FastAPI) → Render
```

---

## Part 1: Deploy Backend to Render

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add deployment config"
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy Backend

1. **Click "New +"** → **"Web Service"**

2. **Connect Repository:**
   - Select `gen-ai-project`
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: coursegraph-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   ```
   Key: OPENAI_API_KEY
   Value: your_openai_api_key_here
   ```
   
   ```
   Key: PYTHON_VERSION
   Value: 3.11.0
   ```

5. **Create Web Service**

6. **Wait for deployment** (takes 5-10 minutes)
   - You'll see build logs in real-time
   - Once complete, you'll get a URL like: `https://coursegraph-backend-xxxx.onrender.com`

7. **Test the backend:**
   - Visit: `https://your-backend-url.onrender.com/api/graph`
   - Should return JSON with 158 courses

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### Step 2: Deploy Frontend

1. **Click "Add New..."** → **"Project"**

2. **Import Repository:**
   - Select `gen-ai-project`
   - Click "Import"

3. **Configure Project:**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variable:**
   Click "Environment Variables"
   
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://your-backend-url.onrender.com
   ```
   
   (Use the Render backend URL from Part 1, Step 6)

5. **Deploy**

6. **Wait for build** (takes 2-3 minutes)
   - You'll get a URL like: `https://coursegraph-xxx.vercel.app`

---

## Part 3: Update CORS

After deploying, you need to update the backend CORS settings.

### Option 1: Update via Render Dashboard

1. Go to your Render dashboard
2. Click on `coursegraph-backend`
3. Go to "Environment" tab
4. Add a new environment variable:
   ```
   Key: CORS_ORIGINS
   Value: ["https://your-vercel-app.vercel.app"]
   ```
5. Click "Save Changes"
6. Service will auto-redeploy

### Option 2: Update code and push

Edit `backend/app/config/settings.py`:

```python
CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "https://your-vercel-app.vercel.app"  # Add your Vercel URL
]
```

Then:
```bash
git add backend/app/config/settings.py
git commit -m "Update CORS for production"
git push origin main
```

Both Vercel and Render will auto-deploy on push.

---

## Part 4: Test Your Live App

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try generating a timeline
3. Click on courses to see prerequisites
4. Upload a resume and verify it works

---

## Important Notes

### Free Tier Limitations

**Render Free Tier:**
- ✅ 750 hours/month (enough for 24/7 uptime)
- ⚠️ **Spins down after 15 min inactivity** (first request takes 30-60 seconds)
- ✅ 512 MB RAM
- ✅ Automatic HTTPS
- ✅ Auto-deploys on git push

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploys on git push

### Keeping Backend Active

The Render free tier sleeps after 15 minutes of inactivity. Options:

1. **Accept the cold start** - First request after sleep takes 30-60 seconds
2. **Use a ping service** (cron-job.org) to ping your backend every 14 minutes
3. **Upgrade to paid tier** ($7/month for always-on)

### Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain (e.g., `coursegraph.com`)
3. Configure DNS records (Vercel provides instructions)

**Render:**
1. Go to Service → Settings → Custom Domain
2. Add your domain
3. Update DNS records

---

## Updating Your App

After deploying, any git push triggers automatic redeployment:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel and Render automatically redeploy!
```

---

## Monitoring

### Render Dashboard
- View logs: Render Dashboard → your service → Logs
- Check status: Green = running, Yellow = deploying
- Monitor usage: Dashboard → Account → Usage

### Vercel Dashboard
- View logs: Project → Deployments → Click deployment → Function logs
- Analytics: Project → Analytics
- Monitor builds: Project → Deployments

---

## Troubleshooting

### Backend not responding
1. Check Render logs for errors
2. Verify `OPENAI_API_KEY` is set
3. Check if service is sleeping (refresh after 30 seconds)

### Frontend can't reach backend
1. Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Verify CORS settings include your Vercel URL
3. Check browser console for CORS errors

### Build failures
1. **Render:** Check Python version matches requirements
2. **Vercel:** Check Node version (Vercel auto-detects)
3. Review build logs for specific errors

---

## Cost Estimate

**Current setup: $0/month**

To upgrade for production:
- Render Pro (always-on): $7/month
- Vercel Pro (more bandwidth): $20/month
- OpenAI API usage: ~$5-50/month depending on traffic

**Total for small production app: ~$12-77/month**

---

## Alternative: Deploy Everything to Railway

If you want both frontend + backend on one platform:

1. Go to https://railway.app
2. Connect GitHub repo
3. Railway auto-detects both services
4. Add `OPENAI_API_KEY` environment variable
5. Deploy

Railway free tier: $5 credit/month (usually enough for low traffic)

---

## Security Checklist

Before going public:
- [x] `.env` files in `.gitignore`
- [x] Environment variables set in Render/Vercel (not committed)
- [ ] Enable Vercel authentication if needed (Settings → Authentication)
- [ ] Set up rate limiting in FastAPI (optional)
- [ ] Monitor API usage on OpenAI dashboard

---

## Support

Issues? Check:
1. Render status page: https://status.render.com
2. Vercel status page: https://www.vercel-status.com
3. Your OpenAI API quota: https://platform.openai.com/usage

---

**You're all set! 🎉**

Your app is now live and accessible worldwide for free.
