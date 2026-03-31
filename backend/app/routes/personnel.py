from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas.personnel import (
    PersonnelCreate,
    PersonnelUpdate,
    PersonnelResponse,
    PersonnelListResponse,
)
from app.auth.dependencies import get_current_user
from app.database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("", response_model=PersonnelResponse)
async def create_personnel(
    personnel_data: PersonnelCreate,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    personnel_col = database["personnel"]
    
    existing = await personnel_col.find_one({"employee_id": personnel_data.employee_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID already exists",
        )
    
    new_personnel = {
        "employee_id": personnel_data.employee_id,
        "full_name": personnel_data.full_name,
        "email": personnel_data.email,
        "department": personnel_data.department,
        "position": personnel_data.position,
        "access_level": personnel_data.access_level,
        "phone": personnel_data.phone,
        "assigned_areas": personnel_data.assigned_areas,
        "clearance_status": "pending",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    
    result = await personnel_col.insert_one(new_personnel)
    new_personnel["_id"] = result.inserted_id
    
    return _personnel_to_response(new_personnel)

@router.get("", response_model=PersonnelListResponse)
async def list_personnel(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    database = get_database()
    personnel_col = database["personnel"]
    
    total = await personnel_col.count_documents({})
    items = await personnel_col.find().skip(skip).limit(limit).to_list(length=limit)
    
    return PersonnelListResponse(
        total=total,
        items=[_personnel_to_response(p) for p in items],
    )

@router.get("/{personnel_id}", response_model=PersonnelResponse)
async def get_personnel(
    personnel_id: str,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    personnel_col = database["personnel"]
    
    try:
        personnel = await personnel_col.find_one({"_id": ObjectId(personnel_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid personnel ID",
        )
    
    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found",
        )
    
    return _personnel_to_response(personnel)

@router.put("/{personnel_id}", response_model=PersonnelResponse)
async def update_personnel(
    personnel_id: str,
    update_data: PersonnelUpdate,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    personnel_col = database["personnel"]
    
    try:
        personnel = await personnel_col.find_one({"_id": ObjectId(personnel_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid personnel ID",
        )
    
    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found",
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    
    await personnel_col.update_one(
        {"_id": ObjectId(personnel_id)},
        {"$set": update_dict},
    )
    
    updated = await personnel_col.find_one({"_id": ObjectId(personnel_id)})
    return _personnel_to_response(updated)

@router.delete("/{personnel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_personnel(
    personnel_id: str,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    personnel_col = database["personnel"]
    
    try:
        result = await personnel_col.delete_one({"_id": ObjectId(personnel_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid personnel ID",
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found",
        )

def _personnel_to_response(personnel: dict) -> PersonnelResponse:
    return PersonnelResponse(
        id=str(personnel["_id"]),
        employee_id=personnel["employee_id"],
        full_name=personnel["full_name"],
        email=personnel["email"],
        department=personnel["department"],
        position=personnel["position"],
        access_level=personnel["access_level"],
        phone=personnel["phone"],
        assigned_areas=personnel.get("assigned_areas", []),
        clearance_status=personnel.get("clearance_status", "pending"),
        is_active=personnel.get("is_active", True),
        created_at=personnel.get("created_at"),
    )
