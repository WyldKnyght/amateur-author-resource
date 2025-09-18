# backend/app/core/config.py
from decouple import config
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # Points to backend/app
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)  # Ensures the folder exists

DATABASE_URL = f"sqlite:///{DATA_DIR / 'fiction_platform.db'}"
class Settings:
    PROJECT_NAME: str = "Fiction Platform API"
    DATABASE_URL: str = config("DATABASE_URL", default=str(DATABASE_URL))
    SECRET_KEY: str = config("SECRET_KEY", default="5!pc^6CRTb^kcfV%")
    CORS_ORIGINS: str = config("CORS_ORIGINS", default="http://localhost:5173")


settings = Settings()
