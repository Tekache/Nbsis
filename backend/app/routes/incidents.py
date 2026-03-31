from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
    IncidentAddNote,
    IncidentResponse,
    IncidentListResponse,
)
from app.auth.dependencies import get_current_user
from app.database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("", response_model=IncidentResponse)
async def create_incident(
    incident_data: IncidentCreate,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    incidents_col = database["incidents"]
    
    new_incident = {
        "title": incident_data.title,
        "description": incident_data.description,
        "incident_type": incident_data.incident_type,
        "severity": incident_data.severity,
        "location": incident_data.location,
        "reported_by": incident_data.reported_by,
        "assigned_to": None,
        "status": "open",
        "evidence": [],
        "notes": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "resolved_at": None,
    }
    
    result = await incidents_col.insert_one(new_incident)
    new_incident["_id"] = result.inserted_id
    
    return _incident_to_response(new_incident)

@router.get("", response_model=IncidentListResponse)
async def list_incidents(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status_filter: str = Query(None),
):
    database = get_database()
    incidents_col = database["incidents"]
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    total = await incidents_col.count_documents(query)
    items = await incidents_col.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    return IncidentListResponse(
        total=total,
        items=[_incident_to_response(i) for i in items],
    )

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    incidents_col = database["incidents"]
    
    try:
        incident = await incidents_col.find_one({"_id": ObjectId(incident_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid incident ID",
        )
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    
    return _incident_to_response(incident)

@router.put("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    update_data: IncidentUpdate,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    incidents_col = database["incidents"]
    
    try:
        incident = await incidents_col.find_one({"_id": ObjectId(incident_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid incident ID",
        )
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    
    if update_dict.get("status") == "resolved" and not incident.get("resolved_at"):
        update_dict["resolved_at"] = datetime.utcnow()
    
    await incidents_col.update_one(
        {"_id": ObjectId(incident_id)},
        {"$set": update_dict},
    )
    
    updated = await incidents_col.find_one({"_id": ObjectId(incident_id)})
    return _incident_to_response(updated)

@router.post("/{incident_id}/notes", response_model=IncidentResponse)
async def add_incident_note(
    incident_id: str,
    note_data: IncidentAddNote,
    current_user: dict = Depends(get_current_user),
):
    database = get_database()
    incidents_col = database["incidents"]
    
    try:
        incident = await incidents_col.find_one({"_id": ObjectId(incident_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid incident ID",
        )
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    
    new_note = {
        "author": note_data.author,
        "text": note_data.note,
        "created_at": datetime.utcnow(),
    }
    
    await incidents_col.update_one(
        {"_id": ObjectId(incident_id)},
        {
            "$push": {"notes": new_note},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    
    updated = await incidents_col.find_one({"_id": ObjectId(incident_id)})
    return _incident_to_response(updated)

def _incident_to_response(incident: dict) -> IncidentResponse:
    return IncidentResponse(
        id=str(incident["_id"]),
        title=incident["title"],
        description=incident["description"],
        incident_type=incident["incident_type"],
        severity=incident["severity"],
        location=incident["location"],
        reported_by=incident["reported_by"],
        assigned_to=incident.get("assigned_to"),
        status=incident.get("status", "open"),
        notes=incident.get("notes", []),
        created_at=incident.get("created_at"),
        updated_at=incident.get("updated_at"),
    )
