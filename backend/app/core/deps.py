from fastapi import Depends, HTTPException, Cookie
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.session import get_user_from_session
from app.models.user import User

def get_current_user(
    session_id: str = Cookie(None), 
    db: Session = Depends(get_session)
) -> User:
    """Dependency to get the current authenticated user"""
    if not session_id:
        raise HTTPException(status_code=401, detail="Please log in")
    
    username = get_user_from_session(session_id)
    if not username:
        raise HTTPException(status_code=401, detail="Please log in again")
    
    user = db.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def get_optional_user(
    session_id: str = Cookie(None), 
    db: Session = Depends(get_session)
) -> User | None:
    """Optional dependency to get the current user (returns None if not authenticated)"""
    if not session_id:
        return None
    
    username = get_user_from_session(session_id)
    if not username:
        return None
    
    user = db.exec(select(User).where(User.username == username)).first()
    return user
