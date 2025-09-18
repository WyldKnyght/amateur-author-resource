# backend/app/core/deps.py
from fastapi import Depends, HTTPException, status, Request
from jose import jwt, JWTError
from app.models.user import User
from app.core.database import get_session
from sqlmodel import Session, select
from app.core.security import SECRET_KEY, ALGORITHM

def get_token_from_header(request: Request):
    auth: str = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return auth[7:]

def get_current_user(token: str = Depends(get_token_from_header), db: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        raise credentials_exception from e
    user = db.exec(select(User).where(User.id == int(user_id))).first()
    if user is None:
        raise credentials_exception
    return user
