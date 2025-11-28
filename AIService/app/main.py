import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Summarization Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["Summarization"])

@app.on_event("startup")
async def startup_event():
    logger.info("AI Summarization Service started")

@app.get("/")
async def root():
    return {
        "service": "AI Summarization Service",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "content": "/api/content",
            "process": "/api/process_content/{id}",
            "text": "/api/summarize_text",
            "pdf_upload": "/api/summarize_pdf_upload",
            "pdf_s3": "/api/summarize_pdf_s3"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
