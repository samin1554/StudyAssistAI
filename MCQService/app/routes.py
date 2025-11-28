from fastapi import APIRouter, HTTPException
from app.services.content_processor import content_processor
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate_mcqs/{content_id}")
async def generate_mcqs(content_id: int, num_questions: int = 10):
    try:
        result = content_processor.process_content_by_id(content_id, num_questions)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
