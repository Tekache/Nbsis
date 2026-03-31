from bson import ObjectId
from typing import Optional

def to_object_id(id_str: Optional[str]) -> Optional[ObjectId]:
    """Convert string to ObjectId"""
    if id_str is None:
        return None
    if isinstance(id_str, ObjectId):
        return id_str
    try:
        return ObjectId(id_str)
    except Exception:
        raise ValueError(f"Invalid ObjectId: {id_str}")

def to_string_id(obj_id: ObjectId) -> str:
    """Convert ObjectId to string"""
    return str(obj_id)
