import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="MCQ Generation Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["MCQ"])

@app.on_event("startup")
async def startup_event():
    logger.info("MCQ Generation Service started")

@app.get("/")
async def root():
    return {
        "service": "MCQ Generation Service",
        "status": "running",
        "endpoint": "/api/generate_mcqs/{content_id}",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
