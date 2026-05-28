from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./patterna.db"
    SECRET_KEY: str = "patterna-skripsi-naura26"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
