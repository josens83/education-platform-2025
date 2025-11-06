from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import get_settings
from app.database import engine, Base
from routers import auth, segments, generate, metrics, recommend
from utils.rate_limiter import clean_expired_entries, rate_limiter
from utils.jwt_handler import verify_token

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    logger.info("Starting Content Management API")
    logger.info(f"Database: {get_settings().database_url.split('@')[1] if '@' in get_settings().database_url else 'configured'}")

    # Initialize database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

    logger.info("API is ready!")

    yield

    # Shutdown
    logger.info("Shutting down...")
    clean_expired_entries()
    logger.info("Shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="Content Management API",
    description="AI-powered content generation and management backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # /generate 엔드포인트만 제한
    if request.url.path.startswith("/api/generate"):
        # JWT에서 user_id 추출
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = verify_token(token)
            if payload and "user_id" in payload:
                await rate_limiter.check_rate_limit(payload["user_id"])

    response = await call_next(request)
    return response

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(segments.router, prefix="/api/segments", tags=["Segments"])
app.include_router(generate.router, prefix="/api/generate", tags=["Generation"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(recommend.router, prefix="/api/recommend", tags=["Recommendations"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Content Management API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/info")
async def info():
    """API information endpoint"""
    return {
        "name": "Content Management API",
        "version": "1.0.0",
        "features": {
            "authentication": "JWT",
            "database": "PostgreSQL + SQLAlchemy",
            "vector_db": "ChromaDB (embedded)",
            "ai": "OpenAI GPT-4 & DALL-E"
        },
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "auth": "/api/auth",
            "segments": "/api/segments",
            "generate": "/api/generate",
            "metrics": "/api/metrics",
            "recommend": "/api/recommend"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=False
    )
