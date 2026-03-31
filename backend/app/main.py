from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, users, personnel, incidents, alerts, access_logs, surveillance
from app.utils.errors import setup_exception_handlers

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Shell Security API...")
    try:
        await connect_to_mongo()
        logger.info("MongoDB connection established")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await close_mongo_connection()

app = FastAPI(
    title="Shell Petroleum Security Management System",
    description="RESTful API for security management and monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup exception handlers
setup_exception_handlers(app)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(personnel.router, prefix="/api/personnel", tags=["personnel"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["incidents"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(access_logs.router, prefix="/api/access-logs", tags=["access_logs"])
app.include_router(surveillance.router, prefix="/api/surveillance", tags=["surveillance"])

@app.get("/")
async def root():
    return {"message": "Shell Petroleum Security Management System API", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running and MongoDB is connected"}
