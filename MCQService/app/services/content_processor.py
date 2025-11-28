import logging
from app.models.database_models import Content
from app.services.database import get_db, close_db
from app.services.mcq_generator import mcq_service
from app.utils.pdf_reader import pdf_reader_service
from app.utils.s3_utils import s3_service
from app.config import S3_BUCKET_NAME

logger = logging.getLogger(__name__)

class ContentProcessor:
    
    @staticmethod
    def process_content_by_id(content_id: int, num_questions: int = 5) -> dict:
        db = get_db()
        try:
            content = db.query(Content).filter(Content.id == content_id).first()
            
            if not content:
                raise ValueError(f"Content {content_id} not found")
            
            logger.info(f"Processing content {content_id}")
            
            if content.object_key and content.file_name:
                pdf_bytes = s3_service.download_file(S3_BUCKET_NAME, content.object_key)
                text, pages = pdf_reader_service.extract_text_from_bytes(pdf_bytes)
                
                if not text or len(text.strip()) == 0:
                    raise ValueError("No text extracted from PDF")
                
                logger.info(f"Extracted {len(text)} chars from {pages} pages")
                
                questions = mcq_service.generate_mcqs(text, num_questions)
                
                return {
                    "content_id": content_id,
                    "title": content.title,
                    "questions": [
                        {
                            "question": q.question,
                            "options": q.options,
                            "correct_option_index": q.correct_option_index,
                            "answer": q.answer
                        } for q in questions
                    ],
                    "num_questions": len(questions),
                    "pages": pages,
                    "content_type": "pdf",
                    "status": "success"
                }
                
            elif content.raw_text:
                logger.info(f"Processing text: {len(content.raw_text)} chars")
                
                questions = mcq_service.generate_mcqs(content.raw_text, num_questions)
                
                return {
                    "content_id": content_id,
                    "title": content.title,
                    "questions": [
                        {
                            "question": q.question,
                            "options": q.options,
                            "correct_option_index": q.correct_option_index,
                            "answer": q.answer
                        } for q in questions
                    ],
                    "num_questions": len(questions),
                    "content_type": "text",
                    "status": "success"
                }
            else:
                raise ValueError("No text or PDF to process")
                
        except Exception as e:
            logger.error(f"Processing failed: {e}")
            raise
        finally:
            close_db(db)
    
    @staticmethod
    def get_all_content():
        db = get_db()
        try:
            contents = db.query(Content).all()
            return [
                {
                    "id": c.id,
                    "title": c.title,
                    "content_type": c.content_type,
                    "status": c.status,
                    "created_at": str(c.created_at)
                }
                for c in contents
            ]
        finally:
            close_db(db)

content_processor = ContentProcessor()
