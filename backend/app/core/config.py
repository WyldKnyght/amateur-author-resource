from decouple import config

class Settings:
    PROJECT_NAME: str = "Fiction Platform API"
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./fiction_platform.db")
    SECRET_KEY: str = config("SECRET_KEY", default="5!pc^6CRTb^kcfV%")
    CORS_ORIGINS: str = config("CORS_ORIGINS", default="http://localhost:5173")

settings = Settings()
