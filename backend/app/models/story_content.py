# backend/app/models/story_content.py
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from .project import Project

class StoryContent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    content: Optional[str] = Field(default=None)
    content_type: str = Field(default="markdown")
    version: int = Field(default=1)
    is_active: bool = Field(default=True)
    auto_saved: bool = Field(default=False)
    save_reason: str = Field(default="manual_save")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    project: Optional[Project] = Relationship(back_populates="story_content")
