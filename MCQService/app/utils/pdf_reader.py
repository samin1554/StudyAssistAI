import PyPDF2
import pdfplumber
import logging
from io import BytesIO

logger = logging.getLogger(__name__)

class PDFReaderService:
    
    @staticmethod
    def extract_text_from_pdf(pdf_file) -> tuple[str, int]:
        try:
            text, pages = PDFReaderService._extract_with_pdfplumber(pdf_file)
            if text and len(text.strip()) > 0:
                return text, pages
            
            logger.info("Trying PyPDF2 fallback")
            text, pages = PDFReaderService._extract_with_pypdf2(pdf_file)
            return text, pages
            
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise ValueError(f"Failed to extract text: {str(e)}")
    
    @staticmethod
    def _extract_with_pdfplumber(pdf_file) -> tuple[str, int]:
        text_parts = []
        
        if hasattr(pdf_file, 'seek'):
            pdf_file.seek(0)
        
        with pdfplumber.open(pdf_file) as pdf:
            pages = len(pdf.pages)
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        
        return "\n".join(text_parts), pages
    
    @staticmethod
    def _extract_with_pypdf2(pdf_file) -> tuple[str, int]:
        text_parts = []
        
        if hasattr(pdf_file, 'seek'):
            pdf_file.seek(0)
        
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        pages = len(pdf_reader.pages)
        
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        
        return "\n".join(text_parts), pages
    
    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> tuple[str, int]:
        pdf_file = BytesIO(pdf_bytes)
        return PDFReaderService.extract_text_from_pdf(pdf_file)

pdf_reader_service = PDFReaderService()
