"""
CourseGraph FastAPI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.api import graph, chat, timeline

# Initialize FastAPI app
app = FastAPI(
    title="CourseGraph API",
    description="Cornell course prerequisite graph with sentiment analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(graph.router, prefix="/api", tags=["Graph"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(timeline.router, prefix="/api", tags=["Timeline"])


@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "healthy",
        "service": "CourseGraph API",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
