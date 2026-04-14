from fastapi import APIRouter, HTTPException, status
from datetime import timedelta
from app.schemas.user import UserSignup, UserLogin, TokenResponse
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.database import get_database
from app.config import settings
from datetime import datetime

router = APIRouter()

@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    database = get_database()
    users_col = database["users"]

    normalized_email = user_data.email.strip().lower()
    clean_full_name = " ".join(user_data.full_name.split())
    
    existing_user = await users_col.find_one({"email": normalized_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = hash_password(user_data.password)
    
    new_user = {
        "email": normalized_email,
        "full_name": clean_full_name,
        "password_hash": hashed_password,
        "role": "user",
        "is_active": True,
        "department": "Security",
        "created_at": datetime.utcnow(),
    }
    
    result = await users_col.insert_one(new_user)
    user_id = str(result.inserted_id)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": normalized_email},
        expires_delta=access_token_expires,
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user_id,
            "email": normalized_email,
            "full_name": clean_full_name,
            "role": "user",
            "is_active": True,
        },
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    database = get_database()
    users_col = database["users"]

    normalized_email = credentials.email.strip().lower()
    
    user = await users_col.find_one({"email": normalized_email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive. Please contact support.",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": normalized_email},
        expires_delta=access_token_expires,
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user.get("role", "user"),
            "is_active": user.get("is_active", True),
        },
    )
