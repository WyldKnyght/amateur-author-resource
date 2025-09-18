# backend/app/api/stories.py
from datetime import timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select, func
from datetime import datetime

from ..core.database import get_session
from ..core.deps import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.story_content import StoryContent
from ..schemas.project import (
    StoryContentCreate,
    StoryContentUpdate,
    StoryContentResponse,
)
from .projects import get_user_project, update_word_count

router = APIRouter()

async def auto_save_content(
    project_id: int, 
    content: str, 
    user_id: int, 
    db: Session
):
    try:
        statement = select(StoryContent).where(
            (StoryContent.project_id == project_id) &
            (StoryContent.is_active == True)
        )
        if active_content := db.exec(statement).first():
            active_content.content = content
            active_content.auto_saved = True
            active_content.save_reason = "auto_save"
            active_content.updated_at = datetime.now(timezone.utc)
            if project := db.exec(
                select(Project).where(Project.id == project_id)
            ).first():
                word_count = len(content.split()) if content else 0
                project.word_count = word_count
                project.last_edited_at = datetime.now(timezone.utc)
                db.add(project)
            db.add(active_content)
            db.commit()
            db.refresh(active_content)
    except Exception as e:
        db.rollback()
        print(f"Auto-save failed for project {project_id}: {e}")

@router.get("/{project_id}/content", response_model=StoryContentResponse)
def get_story_content(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    get_user_project(project_id, current_user, db)
    statement = select(StoryContent).where(
        (StoryContent.project_id == project_id) &
        (StoryContent.is_active == True)
    )
    if content := db.exec(statement).first():
        return content
    else:
        raise HTTPException(status_code=404, detail="Story content not found")

@router.put("/{project_id}/content", response_model=StoryContentResponse)
def save_story_content(
    project_id: int,
    content_data: StoryContentUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    project = get_user_project(project_id, current_user, db)
    statement = select(StoryContent).where(
        (StoryContent.project_id == project_id) &
        (StoryContent.is_active == True)
    )
    active_content = db.exec(statement).first()
    if not active_content:
        active_content = StoryContent(
            project_id=project_id,
            content=content_data.content or "",
            version=1,
            is_active=True
        )
    else:
        if content_data.content is not None:
            active_content.content = content_data.content
        if content_data.auto_saved is not None:
            active_content.auto_saved = content_data.auto_saved
        if content_data.save_reason is not None:
            active_content.save_reason = content_data.save_reason
        active_content.updated_at = datetime.now(timezone.utc)
    db.add(active_content)
    if content_data.content is not None:
        word_count = len(content_data.content.split()) if content_data.content else 0
        project.word_count = word_count
        project.last_edited_at = datetime.now(timezone.utc)
        project.updated_at = datetime.now(timezone.utc)
        db.add(project)
    db.commit()
    db.refresh(active_content)
    return active_content

@router.post("/{project_id}/auto-save")
def auto_save_story_content(
    project_id: int,
    content_data: StoryContentUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    get_user_project(project_id, current_user, db)
    if content_data.content is not None:
        background_tasks.add_task(
            auto_save_content,
            project_id,
            content_data.content,
            current_user.id,
            db
        )
    return {"message": "Auto-save initiated"}

@router.post("/{project_id}/content/version", response_model=StoryContentResponse)
def create_content_version(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    get_user_project(project_id, current_user, db)
    statement = select(StoryContent).where(
        (StoryContent.project_id == project_id) &
        (StoryContent.is_active == True)
    )
    current_content = db.exec(statement).first()
    if not current_content:
        raise HTTPException(status_code=404, detail="No content to version")
    current_content.is_active = False
    max_version_statement = select(func.max(StoryContent.version)).where(
        StoryContent.project_id == project_id
    )
    max_version = db.exec(max_version_statement).one() or 0
    new_version = StoryContent(
        project_id=project_id,
        content=current_content.content,
        content_type=current_content.content_type,
        version=(max_version + 1) if isinstance(max_version, int) else 1,
        is_active=True,
        save_reason="version_save"
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return new_version

@router.get("/{project_id}/content/versions", response_model=List[StoryContentResponse])
def get_content_versions(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    get_user_project(project_id, current_user, db)
    statement = select(StoryContent).where(
        StoryContent.project_id == project_id
    ).order_by(StoryContent.version.desc())
    return db.exec(statement).all()

@router.post("/{project_id}/content/restore/{version}")
def restore_content_version(
    project_id: int,
    version: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    project = get_user_project(project_id, current_user, db)
    statement_restore = select(StoryContent).where(
        (StoryContent.project_id == project_id) &
        (StoryContent.version == version)
    )
    version_to_restore = db.exec(statement_restore).first()
    if not version_to_restore:
        raise HTTPException(status_code=404, detail="Version not found")
    statement_active = select(StoryContent).where(
        (StoryContent.project_id == project_id) &
        (StoryContent.is_active == True)
    )
    if current_active := db.exec(statement_active).first():
        current_active.is_active = False
        db.add(current_active)
    restored_content = StoryContent(
        project_id=project_id,
        content=version_to_restore.content,
        content_type=version_to_restore.content_type,
        version=1,
        is_active=True,
        save_reason="version_restore"
    )
    db.add(restored_content)
    update_word_count(project, db)
    db.commit()
    db.refresh(restored_content)
    return {"message": f"Version {version} restored successfully"}

@router.get("/{project_id}/content/backup")
def backup_content(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    project = get_user_project(project_id, current_user, db)
    statement_versions = select(StoryContent).where(
        StoryContent.project_id == project_id
    ).order_by(StoryContent.version.desc())
    versions = db.exec(statement_versions).all()
    return {
        "project": {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "genre": project.genre,
            "status": project.status,
            "created_at": project.created_at.isoformat(),
            "word_count": project.word_count,
        },
        "content_versions": [
            {
                "version": content.version,
                "content": content.content,
                "content_type": content.content_type,
                "is_active": content.is_active,
                "created_at": content.created_at.isoformat(),
                "save_reason": content.save_reason,
            }
            for content in versions
        ],
        "backup_created_at": datetime.now(timezone.utc).isoformat(),
    }
