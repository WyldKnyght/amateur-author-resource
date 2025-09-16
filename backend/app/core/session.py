# backed/app/core/session.py
from typing import Dict
import uuid

# In-memory session store (use Redis/database in production)
active_sessions: Dict[str, str] = {}

def create_session(username: str) -> str:
    """Create a new session for a user"""
    session_id = str(uuid.uuid4())
    active_sessions[session_id] = username
    return session_id

def get_user_from_session(session_id: str) -> str | None:
    """Get username from session ID"""
    return active_sessions.get(session_id)

def delete_session(session_id: str) -> None:
    """Delete a session"""
    active_sessions.pop(session_id, None)

def get_all_sessions() -> Dict[str, str]:
    """Get all active sessions (for debugging)"""
    return active_sessions.copy()
