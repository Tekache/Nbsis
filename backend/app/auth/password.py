from passlib.context import CryptContext
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(password: str) -> str:
    # Bcrypt has a 72-byte limit for passwords
    if len(password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must not exceed 72 bytes when encoded as UTF-8"
        )
    
    try:
        return pwd_context.hash(password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password hashing failed: {str(e)}"
        )

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Enforce 72-byte limit on verification too
        if len(plain_password.encode('utf-8')) > 72:
            return False
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False
