from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://myuser:mypassword@127.0.0.1:5435/petdb"
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["*"]
    DATA_GO_KR_API_KEY: str = ""
    TOUR_API_KEY: str = ""
    FUSEKI_URL: str = "http://localhost:7200/repositories/petgraph"

    class Config:
        env_file = ".env"

settings = Settings()
