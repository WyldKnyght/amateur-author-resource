# backend/app/api/projects.py
from datetime import timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import datetime

from ..core.database import get_session
from ..core.deps import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.story_content import StoryContent
from ..schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    ProjectWithContent,
)

router = APIRouter()

def get_user_project(
    project_id: int,
    current_user: User,
    db: Session
) -> Project:
    statement = select(Project).where(
        (Project.id == project_id) & (Project.user_id == current_user.id)
    )
    if project := db.exec(statement).first():
        return project
    else:
        raise HTTPException(
            status_code=404,
            detail="Project not found or access denied"
        )

def update_word_count(project: Project, db: Session):
    statement = select(StoryContent).where(
        (StoryContent.project_id == project.id) & (StoryContent.is_active == True)
    )
    active_content = db.exec(statement).first()
    if active_content and active_content.content:
        word_count = len(active_content.content.split())
        project.word_count = word_count
        project.last_edited_at = datetime.now(timezone.utc)
        db.add(project)
        db.commit()
        db.refresh(project)

@router.get("/", response_model=ProjectListResponse)
def list_projects(
    skip: int = Query(0, ge=0, description="Number of projects to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of projects to return"),
    status: Optional[str] = Query(None, description="Filter by project status"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    statement = select(Project).where(Project.user_id == current_user.id)
    if status:
        statement = statement.where(Project.status == status)
    if genre:
        statement = statement.where(Project.genre == genre)
    if search:
        statement = statement.where(
            (Project.title.ilike(f"%{search}%")) |
            (Project.description.ilike(f"%{search}%"))
        )
    projects = db.exec(statement).all()
    total = len(projects)
    page_projects = projects[skip:skip+limit]
    pages = (total + limit - 1) // limit if total > 0 else 1

    return ProjectListResponse(
        projects=page_projects,
        total=total,
        page=(skip // limit) + 1,
        size=len(page_projects),
        pages=pages
    )

@router.post("/", response_model=ProjectResponse)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    db_project = Project(
        **project_data.dict(),
        user_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    initial_content = StoryContent(
        project_id=db_project.id,
        content="",
        version=1,
        is_active=True,
        save_reason="initial_creation"
    )
    db.add(initial_content)
    db.commit()
    db.refresh(initial_content)

    return db_project

@router.get("/{project_id}", response_model=ProjectWithContent)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    project = get_user_project(project_id, current_user, db)
    statement = select(StoryContent).where(
        (StoryContent.project_id == project_id) & (StoryContent.is_active == True)
    )
    active_content = db.exec(statement).first()
    response_data = ProjectWithContent.model_validate(project)
    response_data.content = active_content
    return response_data

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    project = get_user_project(project_id, current_user, db)
    update_data = project_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    project.updated_at = datetime.now(timezone.utc)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    project = get_user_project(project_id, current_user, db)
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.get("/{project_id}/stats")
def get_project_stats(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    project = get_user_project(project_id, current_user, db)
    statement = select(StoryContent).where(
        (StoryContent.project_id == project_id) & (StoryContent.is_active == True)
    )
    active_content = db.exec(statement).first()

    stats = {
        "project_id": project_id,
        "word_count": project.word_count,
        "target_word_count": project.target_word_count,
        "character_count": (
            len(active_content.content)
            if active_content and active_content.content
            else 0
        ),
        "progress_percentage": 0,
        "days_since_creation": (
            datetime.now(timezone.utc) - project.created_at
        ).days,
        "last_edited": (
            project.last_edited_at.isoformat()
            if project.last_edited_at
            else None
        ),
    }

    if project.target_word_count and project.target_word_count > 0:
        stats["progress_percentage"] = min(100, (project.word_count / project.target_word_count) * 100)

    return stats
