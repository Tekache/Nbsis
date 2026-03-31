from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas.access_log import (
    AccessLogCreate,
    AccessLogResponse,
    AccessLogListResponse,
)
from app.auth.dependencies import get_current_user
from app.database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("", response_model=AccessLogResponse)
async def create_access_log(
    log_data: AccessLogCreate,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    access_logs_col = database["access_logs"]
    
    new_log = {
        "personnel_id": log_data.personnel_id,
        "access_point": log_data.access_point,
        "access_type": log_data.access_type,
        "status": log_data.status,
        "timestamp": datetime.utcnow(),
        "reason_if_denied": log_data.reason_if_denied,
        "camera_id": log_data.camera_id,
    }
    
    result = await access_logs_col.insert_one(new_log)
    new_log["_id"] = result.inserted_id
    
    return _log_to_response(new_log)

@router.get("", response_model=AccessLogListResponse)
async def list_access_logs(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    personnel_id: str = Query(None),
    status_filter: str = Query(None),
):
    database = get_database()
    access_logs_col = database["access_logs"]
    
    query = {}
    if personnel_id:
        query["personnel_id"] = personnel_id
    if status_filter:
        query["status"] = status_filter
    
    total = await access_logs_col.count_documents(query)
    items = await access_logs_col.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    return AccessLogListResponse(
        total=total,
        items=[_log_to_response(l) for l in items],
    )

@router.get("/{log_id}", response_model=AccessLogResponse)
async def get_access_log(
    log_id: str,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    access_logs_col = database["access_logs"]
    
    try:
        log = await access_logs_col.find_one({"_id": ObjectId(log_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid log ID",
        )
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access log not found",
        )
    
    return _log_to_response(log)

@router.put("/{log_id}", response_model=AccessLogResponse)
async def update_access_log(
    log_id: str,
    update_data: dict,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    access_logs_col = database["access_logs"]

    try:
        log = await access_logs_col.find_one({"_id": ObjectId(log_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid log ID",
        )

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access log not found",
        )

    access_type = update_data.get("access_type")
    if access_type:
        await access_logs_col.update_one(
            {"_id": ObjectId(log_id)},
            {"$set": {"access_type": access_type}},
        )

    updated = await access_logs_col.find_one({"_id": ObjectId(log_id)})
    return _log_to_response(updated)

def _log_to_response(log: dict) -> AccessLogResponse:
    return AccessLogResponse(
        id=str(log["_id"]),
        personnel_id=log["personnel_id"],
        access_point=log["access_point"],
        access_type=log["access_type"],
        status=log["status"],
        timestamp=log.get("timestamp"),
        reason_if_denied=log.get("reason_if_denied"),
    )
