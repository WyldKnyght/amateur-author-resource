# backend/app/schemas/project.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ProjectBase(BaseModel):
    """Base schema for Project model"""
    title: str = Field(..., min_length=1, max_length=255, description="Project title")
    description: Optional[str] = Field(None, max_length=1000, description="Project description")
    genre: Optional[str] = Field(None, max_length=100, description="Story genre")
    status: str = Field(default="draft", description="Project status")
    is_private: bool = Field(default=True, description="Privacy setting")
    target_word_count: Optional[int] = Field(None, ge=0, description="Target word count")


class ProjectCreate(ProjectBase):
    """Schema for creating a new project"""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    genre: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = None
    is_private: Optional[bool] = None
    target_word_count: Optional[int] = Field(None, ge=0)


class ProjectResponse(ProjectBase):
    """Schema for project response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    word_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    last_edited_at: Optional[datetime]


class ProjectListResponse(BaseModel):
    """Schema for project list response"""
    projects: List[ProjectResponse]
    total: int
    page: int
    size: int
    pages: int


# Story Content Schemas
class StoryContentBase(BaseModel):
    """Base schema for StoryContent model"""
    content: Optional[str] = Field(None, description="Story content")
    content_type: str = Field(default="markdown", description="Content format type")


class StoryContentCreate(StoryContentBase):
    """Schema for creating story content"""
    project_id: int


class StoryContentUpdate(BaseModel):
    """Schema for updating story content"""
    content: Optional[str] = None
    auto_saved: Optional[bool] = Field(default=False)
    save_reason: Optional[str] = Field(default="manual_save")


class StoryContentResponse(StoryContentBase):
    """Schema for story content response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    project_id: int
    version: int
    is_active: bool
    auto_saved: bool
    save_reason: str
    created_at: datetime
    updated_at: Optional[datetime]


class ProjectWithContent(ProjectResponse):
    """Extended project schema that includes content"""
    content: Optional[StoryContentResponse] = None