from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    """User model for database storage"""
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, min_length=3, max_length=50)
    email: str = Field(index=True, unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

class UserCreate(SQLModel):
    """Schema for user creation"""
    username: str = Field(min_length=3, max_length=50)
    email: str
    password: str = Field(min_length=8)

class UserLogin(SQLModel):
    """Schema for user login"""
    username: str
    password: str

class UserRead(SQLModel):
    """Schema for user data returned to client"""
    id: int
    username: str
    email: str
    created_at: datetime
    is_active: bool

class UserUpdate(SQLModel):
    """Schema for user updates"""
    email: Optional[str] = None
    password: Optional[str] = None
