from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_db_and_tables
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from .api import projects, stories

app = FastAPI(
    title="Fiction Platform API",
    description="A comprehensive platform for fiction writers",
    version="1.0.0"
)

# Register routers AFTER app is created
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(stories.router, prefix="/api/stories", tags=["stories"])
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(users_router, prefix="/api/users", tags=["users"])

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Fiction Platform API - Ready to help writers create amazing stories!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Fiction Platform API is running"}
