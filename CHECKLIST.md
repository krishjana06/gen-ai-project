# Setup Checklist ✅

## Required Setup (First Time Only)

- [ ] **Python 3.12+** installed
  ```bash
  python --version  # Should be 3.12 or higher
  ```

- [ ] **Node.js 18+** installed
  ```bash
  node --version  # Should be 18 or higher
  ```

- [ ] **OpenAI API Key** obtained from https://platform.openai.com/api-keys

- [ ] **Dependencies installed**
  ```bash
  npm run install:all
  ```

- [ ] **OpenAI key added to backend/.env**
  ```env
  OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
  ```

## Ready to Run!

```bash
npm run dev
```

Visit http://localhost:3000 🎉

---

## Not Required ❌

- ❌ Database setup (uses JSON files)
- ❌ Reddit API key (optional, not used)
- ❌ Rate My Professor API key (not needed)
- ❌ Any other API keys

---

## Quick Test

Once running, test these:

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend responds: `curl http://localhost:8000/api/graph`
- [ ] Generate a timeline with a sample prompt
- [ ] Click on a course to see difficulty/enjoyment scores
- [ ] Chat works (ask "Tell me about CS 2110")

All working? You're done! ✅
