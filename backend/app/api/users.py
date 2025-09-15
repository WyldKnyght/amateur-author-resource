from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User, UserRead, UserUpdate
from app.core.security import hash_password

router = APIRouter()

@router.get("/profile", response_model=UserRead)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return UserRead(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )

@router.put("/profile")
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Update current user's profile"""
    if user_update.email:
        # Check if email is already taken by another user
        existing_email = db.exec(
            select(User).where(
                User.email == user_update.email,
                User.id != current_user.id
            )
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = user_update.email
    
    if user_update.password:
        if len(user_update.password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        current_user.password_hash = hash_password(user_update.password)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Profile updated successfully"}

@router.get("/dashboard")
def get_user_dashboard(current_user: User = Depends(get_current_user)):
    """Get user dashboard data"""
    return {
        "message": f"Welcome to your dashboard, {current_user.username}!",
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "member_since": current_user.created_at
        },
        "stats": {
            "projects": 0,  # Will be implemented in Phase 2
            "characters": 0,  # Will be implemented in Phase 2
            "word_count": 0   # Will be implemented in Phase 2
        }
    }
