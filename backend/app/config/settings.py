"""
Application settings and configuration
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""

    # API Keys
    OPENAI_API_KEY: str = ""
    REDDIT_CLIENT_ID: str = ""
    REDDIT_CLIENT_SECRET: str = ""
    REDDIT_USER_AGENT: str = "CourseGraph:v1.0"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Cornell API
    CORNELL_ROSTER_SEMESTER: str = "FA25"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
