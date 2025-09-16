# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import hash_password, verify_password
from app.core.session import create_session, get_user_from_session, delete_session
from app.models.user import User, UserCreate, UserLogin

router = APIRouter()

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_session)):
    """Register a new user"""
    # Check if username already exists
    existing_username = db.exec(select(User).where(User.username == user_data.username)).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    existing_email = db.exec(select(User).where(User.email == user_data.email)).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"message": "User created successfully", "username": user.username}

@router.post("/login")
def login(user_data: UserLogin, response: Response, db: Session = Depends(get_session)):
    """Login user and create session"""
    # Find user
    user = db.exec(select(User).where(User.username == user_data.username)).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is disabled")
    
    # Create session
    session_id = create_session(user.username)
    
    # Set secure cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        max_age=86400,  # 24 hours
        samesite="lax",
        secure=False  # Set to True in production with HTTPS
    )
    
    return {
        "message": "Logged in successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }

@router.post("/logout")
def logout(response: Response, session_id: str = Cookie(None)):
    """Logout user and delete session"""
    if session_id:
        delete_session(session_id)
    
    response.delete_cookie("session_id")
    return {"message": "Logged out successfully"}

@router.get("/me")
def get_current_user_info(session_id: str = Cookie(None), db: Session = Depends(get_session)):
    """Get current user information"""
    if not session_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    username = get_user_from_session(session_id)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user = db.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at,
        "is_active": user.is_active
    }

@router.get("/check")
def check_auth_status(session_id: str = Cookie(None)):
    """Check if user is authenticated"""
    if not session_id:
        return {"authenticated": False}
    
    username = get_user_from_session(session_id)
    return {"authenticated": username is not None, "username": username}
