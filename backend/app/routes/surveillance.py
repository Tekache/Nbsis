from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.dependencies import get_current_user

router = APIRouter()

_CAMERAS = [
    {
        "id": "CAM-01",
        "name": "Main Gate Camera",
        "location": "Main Gate",
        "status": "online",
        "lastActivity": "2 minutes ago",
    },
    {
        "id": "CAM-03",
        "name": "CCTV Hub Camera",
        "location": "Control Room",
        "status": "online",
        "lastActivity": "5 minutes ago",
    },
    {
        "id": "CAM-07",
        "name": "Storage Yard Camera",
        "location": "Storage Yard",
        "status": "offline",
        "lastActivity": "1 hour ago",
    },
    {
        "id": "CAM-08",
        "name": "Pipeline Corridor Camera",
        "location": "Pipeline Corridor",
        "status": "online",
        "lastActivity": "Just now",
    },
]

@router.get("/cameras")
async def list_cameras(current_user: dict = Depends(get_current_user)):
    return {"items": _CAMERAS}

@router.get("/cameras/{camera_id}/footage")
async def get_camera_footage(camera_id: str, current_user: dict = Depends(get_current_user)):
    camera = next((c for c in _CAMERAS if c["id"] == camera_id), None)
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found",
        )

    return {
        "id": camera_id,
        "duration": "00:15:24",
        "recording": camera["status"] == "online",
        "status": camera["status"],
        "location": camera["location"],
    }
