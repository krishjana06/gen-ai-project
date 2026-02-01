# CourseGraph - Complete Setup & Run Guide

## 🎯 Goal
Get CourseGraph running with your Cornell CS + Math course data, complete with AI-powered chat.

---

## 📋 Prerequisites Check

Before starting, verify you have:
- ✅ Python 3.9+ installed → Run: `python3 --version`
- ✅ pip installed → Run: `pip --version`
- ✅ Gemini API key configured (✅ Done!)

---

## 🚀 Step-by-Step Setup Instructions

### STEP 1: Navigate to Project Directory

```bash
cd /Users/krishjana/Desktop/gen-ai-project/backend
```

---

### STEP 2: Activate Virtual Environment

The virtual environment is already created. Activate it:

**On Mac/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

---

### STEP 3: Verify Dependencies

All dependencies are installed. Verify with:

```bash
pip list | grep -E "fastapi|networkx|google-generativeai"
```

You should see:
- fastapi (0.109.0)
- networkx (3.2.1)
- google-generativeai (0.3.2)

---

### STEP 4: Run Data Pipeline (Already Done!)

Your data is already scraped, but if you want to refresh it:

```bash
# 1. Scrape Cornell courses (2 seconds)
python scripts/scraper.py

# 2. Build the graph with Gemini AI (30 seconds)
python scripts/build_graph.py

# Optional: Reddit sentiment (requires Reddit API keys)
# python scripts/reddit_scraper.py
# python scripts/sentiment_analyzer.py
```

**Expected Output:**
- ✅ `data/raw_courses.json` created (158 courses)
- ✅ `data/graph_data.json` created (graph with nodes & edges)

---

### STEP 5: Start the Backend Server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**✅ Backend is now running at:** `http://localhost:8000`

---

## 🧪 Test the Backend

Open a **new terminal** (keep the server running) and test:

### Test 1: Health Check
```bash
curl http://localhost:8000/
```

**Expected Response:**
```json
{"status":"healthy","service":"CourseGraph API","version":"1.0.0"}
```

---

### Test 2: Get Course Graph
```bash
curl http://localhost:8000/api/graph | python3 -m json.tool | head -30
```

**Expected Response:**
You should see course data with nodes containing:
- `id`: "CS 4820"
- `title`: Course name
- `description`: Course description
- `difficulty_score`, `enjoyment_score`
- `centrality`, `in_degree`, `out_degree`

---

### Test 3: Chat with AI (Gemini Integration)
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the prerequisites for CS 4820?"}'
```

**Expected Response:**
The AI should respond with information about CS 4820's prerequisites based on the graph data.

---

## 🎨 Access the API Documentation

While the backend is running, visit:

**Interactive API Docs:** http://localhost:8000/docs

This gives you a Swagger UI where you can:
- View all endpoints
- Test API calls directly in the browser
- See request/response schemas

---

## 📊 Understanding Your Data

### Data Files Location
All generated data is in: `/Users/krishjana/Desktop/gen-ai-project/backend/data/`

**Check what you have:**
```bash
ls -lh data/
```

You should see:
- `raw_courses.json` (~105 KB) - 158 CS + Math courses
- `graph_data.json` (~125 KB) - NetworkX graph structure

### View Sample Course Data
```bash
# See first 3 courses
python3 -c "import json; data=json.load(open('data/raw_courses.json')); print(json.dumps(data['courses'][:3], indent=2))"
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "ModuleNotFoundError"
**Problem:** Missing Python package

**Solution:**
```bash
source venv/bin/activate  # Make sure venv is activated
pip install -r requirements.txt
```

---

### Issue 2: "Address already in use" (Port 8000)
**Problem:** Another process is using port 8000

**Solution:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
python -m uvicorn app.main:app --reload --port 8001
```

---

### Issue 3: "GEMINI_API_KEY not configured"
**Problem:** API key not loaded

**Solution:**
```bash
# Verify .env file exists
cat .env | grep GEMINI_API_KEY

# If empty, the .env file is already configured for you!
```

---

### Issue 4: Empty graph (0 edges)
**Problem:** Prerequisites not parsed

**Solution:**
This is normal if prerequisite text is missing from Cornell API. The graph will still have 158 nodes. To add edges, you need course data with prerequisite information.

---

## 📱 Next Steps: Frontend (Optional)

The backend is fully functional! To add a 3D visualization frontend:

### Option 1: Simple HTML Viewer (Quick Test)
Create `backend/test_viewer.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>CourseGraph Test</h1>
  <div id="graph"></div>
  <script>
    fetch('http://localhost:8000/api/graph')
      .then(r => r.json())
      .then(data => {
        document.getElementById('graph').innerHTML =
          `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      });
  </script>
</body>
</html>
```

Open in browser to see raw graph data.

---

### Option 2: Full Next.js Frontend (Future Session)
- 3D ForceGraph visualization
- Interactive chat interface
- Course details panel
- Sentiment-based styling

---

## 🎓 What You Have Now

✅ **Working Backend API**
- 158 CS + Math courses loaded
- Graph structure with NetworkX
- Gemini AI integration
- RESTful API endpoints

✅ **Chat Functionality**
- Ask questions about courses
- Get AI-powered recommendations
- Query prerequisites

✅ **Scalable Architecture**
- Can add more subjects (Physics, Engineering, etc.)
- Can integrate Reddit sentiment
- Ready for frontend integration

---

## 🔄 Daily Usage Workflow

### Starting the Application

1. **Open Terminal**
2. **Navigate to backend:**
   ```bash
   cd /Users/krishjana/Desktop/gen-ai-project/backend
   ```

3. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

4. **Start server:**
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

5. **Access API:** http://localhost:8000/docs

### Stopping the Application

Press `Ctrl+C` in the terminal running the server.

---

## 📞 Getting Help

If you encounter issues:

1. **Check server logs** in the terminal where you ran `uvicorn`
2. **Verify .env file** has your API key: `cat .env`
3. **Test dependencies:** `pip list`
4. **Check data files exist:** `ls -lh data/`

---

## 🎉 Success Checklist

- [ ] Virtual environment activated (`(venv)` in prompt)
- [ ] Server running on port 8000
- [ ] Health check returns `{"status":"healthy"}`
- [ ] `/api/graph` returns 158 courses
- [ ] `/api/chat` responds with AI-generated text
- [ ] API docs accessible at http://localhost:8000/docs

**If all boxes checked → You're ready to go!** 🚀

---

## 📚 API Usage Examples

### Example 1: Get All Courses
```bash
curl http://localhost:8000/api/graph | jq '.nodes | length'
# Returns: 158
```

### Example 2: Find CS Courses
```bash
curl http://localhost:8000/api/graph | jq '.nodes[] | select(.subject=="CS") | .title' | head -5
```

### Example 3: Chat - Find Prerequisites
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to take CS 4820. What do I need?"}'
```

### Example 4: Chat - Course Recommendations
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Recommend easy CS electives for a junior"}'
```

### Example 5: Get Graph Statistics
```bash
curl http://localhost:8000/api/graph | jq '{
  total_nodes: .nodes | length,
  total_edges: .links | length,
  subjects: [.nodes[].subject] | unique
}'
```

---

**You're all set! Your CourseGraph backend is ready to serve course data and answer questions.** 🎓📚
