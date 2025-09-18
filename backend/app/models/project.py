# backend/app/models/project.py
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    genre: Optional[str] = Field(default=None)
    status: str = Field(default="draft")
    is_private: bool = Field(default=True)
    word_count: int = Field(default=0)
    target_word_count: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    last_edited_at: Optional[datetime] = Field(default=None)
    user_id: int = Field(foreign_key="user.id", nullable=False)
    user: Optional["User"] = Relationship(back_populates="projects")
    story_content: List["StoryContent"] = Relationship(back_populates="project")
