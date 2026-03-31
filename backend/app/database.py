from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from app.config import settings

client = None
database = None

async def connect_to_mongo():
    global client, database
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        database = client[settings.DATABASE_NAME]
        
        # Test connection
        await database.command('ping')
        print("Successfully connected to MongoDB")
        
        # Create indexes
        await _create_indexes()

        # Seed demo data if needed
        await _ensure_demo_data()
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

async def _create_indexes():
    """Create necessary database indexes"""
    try:
        users_col = database["users"]
        await users_col.create_index("email", unique=True)
        
        personnel_col = database["personnel"]
        await personnel_col.create_index("employee_id", unique=True)
        
        incidents_col = database["incidents"]
        await incidents_col.create_index("created_at")
        
        access_logs_col = database["access_logs"]
        await access_logs_col.create_index("timestamp")
        
        alerts_col = database["alerts"]
        await alerts_col.create_index("created_at")
        
        print("Database indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")

async def _ensure_demo_data():
    """Insert demo data when collections are empty to avoid blank UI states."""
    try:
        now = datetime.utcnow()

        personnel_col = database["personnel"]
        alerts_col = database["alerts"]
        incidents_col = database["incidents"]
        access_logs_col = database["access_logs"]

        if await personnel_col.count_documents({}) == 0:
            personnel_seed = [
                {
                    "employee_id": "EMP-1001",
                    "full_name": "Amina Yusuf",
                    "email": "amina.yusuf@shell.com",
                    "department": "Security",
                    "position": "Security Officer",
                    "access_level": "Level 2",
                    "phone": "+234-555-0101",
                    "assigned_areas": ["Main Gate", "Control Room"],
                    "clearance_status": "approved",
                    "is_active": True,
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "employee_id": "EMP-1002",
                    "full_name": "David Okoro",
                    "email": "david.okoro@shell.com",
                    "department": "Monitoring",
                    "position": "CCTV Analyst",
                    "access_level": "Level 1",
                    "phone": "+234-555-0102",
                    "assigned_areas": ["CCTV Hub"],
                    "clearance_status": "approved",
                    "is_active": True,
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "employee_id": "EMP-1003",
                    "full_name": "Grace Bello",
                    "email": "grace.bello@shell.com",
                    "department": "Field Operations",
                    "position": "Response Team Lead",
                    "access_level": "Level 3",
                    "phone": "+234-555-0103",
                    "assigned_areas": ["Pipeline Sector A"],
                    "clearance_status": "approved",
                    "is_active": True,
                    "created_at": now,
                    "updated_at": now,
                },
            ]
            await personnel_col.insert_many(personnel_seed)

        if await incidents_col.count_documents({}) == 0:
            incidents_seed = [
                {
                    "title": "Unauthorized access attempt",
                    "description": "Multiple badge failures detected at the main gate.",
                    "incident_type": "Access Control",
                    "severity": "high",
                    "location": "Main Gate",
                    "reported_by": "System",
                    "assigned_to": "Response Team",
                    "status": "open",
                    "evidence": [],
                    "notes": [],
                    "created_at": now,
                    "updated_at": now,
                    "resolved_at": None,
                },
                {
                    "title": "Suspicious activity near storage area",
                    "description": "Motion detected after hours near storage tank B.",
                    "incident_type": "Surveillance",
                    "severity": "medium",
                    "location": "Storage Tank B",
                    "reported_by": "CCTV Analyst",
                    "assigned_to": None,
                    "status": "investigating",
                    "evidence": [],
                    "notes": [],
                    "created_at": now,
                    "updated_at": now,
                    "resolved_at": None,
                },
            ]
            await incidents_col.insert_many(incidents_seed)

        if await alerts_col.count_documents({}) == 0:
            alerts_seed = [
                {
                    "alert_type": "Intrusion",
                    "severity": "high",
                    "message": "Perimeter breach detected at Sector 4.",
                    "location": "Sector 4",
                    "personnel_id": "EMP-1003",
                    "is_resolved": False,
                    "created_at": now,
                    "resolved_at": None,
                },
                {
                    "alert_type": "System",
                    "severity": "medium",
                    "message": "Camera 7 offline. Auto-restart initiated.",
                    "location": "Pipeline Corridor",
                    "personnel_id": None,
                    "is_resolved": False,
                    "created_at": now,
                    "resolved_at": None,
                },
            ]
            await alerts_col.insert_many(alerts_seed)

        if await access_logs_col.count_documents({}) == 0:
            access_logs_seed = [
                {
                    "personnel_id": "EMP-1001",
                    "access_point": "Main Gate",
                    "access_type": "Level 2",
                    "status": "granted",
                    "timestamp": now,
                    "reason_if_denied": None,
                    "camera_id": "CAM-01",
                },
                {
                    "personnel_id": "EMP-1002",
                    "access_point": "CCTV Hub",
                    "access_type": "Level 1",
                    "status": "granted",
                    "timestamp": now,
                    "reason_if_denied": None,
                    "camera_id": "CAM-03",
                },
                {
                    "personnel_id": "EMP-1004",
                    "access_point": "Storage Gate",
                    "access_type": "Level 2",
                    "status": "denied",
                    "timestamp": now,
                    "reason_if_denied": "Badge expired",
                    "camera_id": "CAM-08",
                },
            ]
            await access_logs_col.insert_many(access_logs_seed)
    except Exception as e:
        print(f"Error seeding demo data: {e}")

def get_database():
    return database
