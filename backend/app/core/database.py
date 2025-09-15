
from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Create SQLite engine
connect_args = {"check_same_thread": False}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, echo=True)

def create_db_and_tables():
    """Create all database tables"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Database session dependency"""
    with Session(engine) as session:
        yield session