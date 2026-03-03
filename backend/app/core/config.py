from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://petgraph_user:petgraph_pass@localhost:5432/petgraph"
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    DATA_GO_KR_API_KEY: str = ""
    TOUR_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
