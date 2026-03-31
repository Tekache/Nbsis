from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta
from bson import ObjectId
from app.schemas.user import (
    UserResponse,
    UserProfileResponse,
    UserProfileUpdate,
    PasswordChangeRequest,
)
from app.auth.dependencies import get_current_user, get_admin_user
from app.auth.password import verify_password, hash_password
from app.auth.jwt import create_access_token
from app.config import settings
from app.database import get_database

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user.get("role", "user"),
        is_active=current_user.get("is_active", True),
    )

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    created_at = current_user.get("created_at")
    join_date = created_at.strftime("%Y-%m-%d") if created_at else None
    return UserProfileResponse(
        id=str(current_user["_id"]),
        name=current_user.get("full_name", ""),
        email=current_user.get("email", ""),
        role=current_user.get("role", "user"),
        department=current_user.get("department"),
        joinDate=join_date,
    )

@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    update_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    users_col = database["users"]

    update_fields = {}
    if update_data.name is not None:
        update_fields["full_name"] = update_data.name
    if update_data.department is not None:
        update_fields["department"] = update_data.department

    new_email = update_data.email
    if new_email and new_email != current_user.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email changes are not supported yet. Please contact an admin.",
        )

    if update_fields:
        await users_col.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_fields},
        )

    updated = await users_col.find_one({"_id": current_user["_id"]})
    created_at = updated.get("created_at")
    join_date = created_at.strftime("%Y-%m-%d") if created_at else None

    return UserProfileResponse(
        id=str(updated["_id"]),
        name=updated.get("full_name", ""),
        email=updated.get("email", ""),
        role=updated.get("role", "user"),
        department=updated.get("department"),
        joinDate=join_date,
    )

@router.post("/change-password")
async def change_password(
    payload: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
):
    if not verify_password(payload.old_password, current_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    new_hash = hash_password(payload.new_password)
    database = get_database()
    await database["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password_hash": new_hash}},
    )

    return {"status": "ok"}

@router.get("/all", response_model=list[UserResponse])
async def list_all_users(admin_user: dict = Depends(get_admin_user)):
    database = get_database()
    users_col = database["users"]
    
    users = await users_col.find().to_list(length=None)
    
    return [
        UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user["full_name"],
            role=user.get("role", "user"),
            is_active=user.get("is_active", True),
        )
        for user in users
    ]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, admin_user: dict = Depends(get_admin_user)):
    database = get_database()
    users_col = database["users"]
    
    try:
        user = await users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID",
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        role=user.get("role", "user"),
        is_active=user.get("is_active", True),
    )
