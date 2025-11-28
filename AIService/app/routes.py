from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.request_models import TextSummarizeRequest, S3SummarizeRequest, SummarizeResponse
from app.services.summarizer import summarization_service
from app.services.pdf_reader import pdf_reader_service
from app.utils.s3_utils import s3_service
from app.services.content_processor import content_processor
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/content")
async def get_all_content():
    try:
        contents = content_processor.get_all_content()
        return {"contents": contents, "count": len(contents)}
    except Exception as e:
        logger.error(f"Fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process_content/{content_id}")
async def process_content(content_id: int, max_length: int = 150, min_length: int = 50):
    try:
        result = content_processor.process_content_by_id(content_id, max_length, min_length)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize_text", response_model=SummarizeResponse)
async def summarize_text(request: TextSummarizeRequest):
    try:
        summary = summarization_service.summarize(request.text, request.max_length, request.min_length)
        
        return SummarizeResponse(
            summary=summary,
            original_length=len(request.text),
            summary_length=len(summary),
            status="success"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize_pdf_upload", response_model=SummarizeResponse)
async def summarize_pdf_upload(file: UploadFile = File(...), max_length: int = 150, min_length: int = 50):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files supported")
        
        pdf_content = await file.read()
        text, pages = pdf_reader_service.extract_text_from_bytes(pdf_content)
        
        if not text or len(text.strip()) == 0:
            raise HTTPException(status_code=400, detail="No text extracted from PDF")
        
        summary = summarization_service.summarize(text, max_length, min_length)
        
        return SummarizeResponse(
            summary=summary,
            original_length=len(text),
            summary_length=len(summary),
            status="success",
            pages=pages
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize_pdf_s3", response_model=SummarizeResponse)
async def summarize_pdf_s3(request: S3SummarizeRequest):
    try:
        pdf_bytes = s3_service.download_file(request.bucket_name, request.object_key)
        text, pages = pdf_reader_service.extract_text_from_bytes(pdf_bytes)
        
        if not text or len(text.strip()) == 0:
            raise HTTPException(status_code=400, detail="No text extracted from PDF")
        
        summary = summarization_service.summarize(text, request.max_length, request.min_length)
        
        return SummarizeResponse(
            summary=summary,
            original_length=len(text),
            summary_length=len(summary),
            status="success",
            pages=pages
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
