# backend/app/core/database.py

from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "sqlite:///data/fiction_platform.db"
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
