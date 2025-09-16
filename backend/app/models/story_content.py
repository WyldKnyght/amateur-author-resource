# backed/app/models/story_content.py
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from .project import Project

class StoryContent(SQLModel, table=True):
    """
    SQLModel table for manuscript content with basic versioning.
    Stores the actual story text and metadata.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    content: Optional[str] = Field(default=None)
    content_type: str = Field(default="markdown")  # markdown, html, plain_text
    version: int = Field(default=1)
    is_active: bool = Field(default=True)

    auto_saved: bool = Field(default=False)
    save_reason: str = Field(default="manual_save")  # manual_save, auto_save, version_save

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)

    project: Optional[Project] = Relationship(back_populates="story_content")
