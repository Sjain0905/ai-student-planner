import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Student Success Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-ai-student-planner-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL default to SQLite or Postgres
    # Can set DATABASE_URL="postgresql://user:password@localhost:5432/ai_student_planner"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ai_student_planner.db")
    
    # AI API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
