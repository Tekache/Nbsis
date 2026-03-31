from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas.alert import (
    AlertCreate,
    AlertUpdate,
    AlertResponse,
    AlertListResponse,
)
from app.auth.dependencies import get_current_user
from app.database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("", response_model=AlertResponse)
async def create_alert(
    alert_data: AlertCreate,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    alerts_col = database["alerts"]
    
    new_alert = {
        "alert_type": alert_data.alert_type,
        "severity": alert_data.severity,
        "message": alert_data.message,
        "location": alert_data.location,
        "personnel_id": alert_data.personnel_id,
        "is_resolved": False,
        "created_at": datetime.utcnow(),
        "resolved_at": None,
    }
    
    result = await alerts_col.insert_one(new_alert)
    new_alert["_id"] = result.inserted_id
    
    return _alert_to_response(new_alert)

@router.get("", response_model=AlertListResponse)
async def list_alerts(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    unresolved_only: bool = Query(False),
):
    database = get_database()
    alerts_col = database["alerts"]
    
    query = {}
    if unresolved_only:
        query["is_resolved"] = False
    
    total = await alerts_col.count_documents(query)
    unresolved = await alerts_col.count_documents({"is_resolved": False})
    items = await alerts_col.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    return AlertListResponse(
        total=total,
        unresolved=unresolved,
        items=[_alert_to_response(a) for a in items],
    )

@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    alerts_col = database["alerts"]
    
    try:
        alert = await alerts_col.find_one({"_id": ObjectId(alert_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid alert ID",
        )
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )
    
    return _alert_to_response(alert)

@router.put("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: str,
    update_data: AlertUpdate,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    alerts_col = database["alerts"]
    
    try:
        alert = await alerts_col.find_one({"_id": ObjectId(alert_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid alert ID",
        )
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )
    
    update_dict = {
        "is_resolved": update_data.is_resolved,
    }
    
    if update_data.is_resolved:
        update_dict["resolved_at"] = datetime.utcnow()
    
    await alerts_col.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": update_dict},
    )
    
    updated = await alerts_col.find_one({"_id": ObjectId(alert_id)})
    return _alert_to_response(updated)

@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: str,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    alerts_col = database["alerts"]
    
    try:
        result = await alerts_col.delete_one({"_id": ObjectId(alert_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid alert ID",
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )

def _alert_to_response(alert: dict) -> AlertResponse:
    return AlertResponse(
        id=str(alert["_id"]),
        alert_type=alert["alert_type"],
        severity=alert["severity"],
        message=alert["message"],
        location=alert.get("location"),
        personnel_id=alert.get("personnel_id"),
        is_resolved=alert.get("is_resolved", False),
        created_at=alert.get("created_at"),
    )
