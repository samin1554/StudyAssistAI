from transformers import pipeline
import logging
from app.config import SUMMARIZATION_MODEL, MAX_SUMMARY_LENGTH, MIN_SUMMARY_LENGTH

logger = logging.getLogger(__name__)

class SummarizationService:
    def __init__(self):
        self.model = None
        self._load_model()
    
    def _load_model(self):
        try:
            logger.info(f"Loading model: {SUMMARIZATION_MODEL}")
            self.model = pipeline("summarization", model=SUMMARIZATION_MODEL)
            logger.info("Model loaded")
        except Exception as e:
            logger.error(f"Model load failed: {e}")
            raise
    
    def summarize(self, text: str, max_length: int = None, min_length: int = None) -> str:
        if not text or len(text.strip()) == 0:
            raise ValueError("Text cannot be empty")
        
        max_len = max_length or MAX_SUMMARY_LENGTH
        min_len = min_length or MIN_SUMMARY_LENGTH
        
        if min_len >= max_len:
            min_len = max_len - 10
        
        try:
            max_input_tokens = 1024
            
            if len(text.split()) > max_input_tokens:
                chunks = self._split_text_smart(text, max_input_tokens)
                logger.info(f"Processing {len(chunks)} chunks")
                
                chunk_summaries = []
                for i, chunk in enumerate(chunks):
                    result = self.model(chunk, max_length=max_len, min_length=min_len // 2, 
                                      do_sample=False, truncation=True)
                    chunk_summaries.append(result[0]['summary_text'])
                
                combined = " ".join(chunk_summaries)
                
                if len(combined.split()) > max_len:
                    logger.info("Re-summarizing for conciseness")
                    final_result = self.model(combined, max_length=max_len, min_length=min_len,
                                            do_sample=False, truncation=True)
                    return final_result[0]['summary_text']
                
                return combined
            else:
                result = self.model(text, max_length=max_len, min_length=min_len,
                                  do_sample=False, truncation=True)
                return result[0]['summary_text']
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            raise
    
    def _split_text_smart(self, text: str, max_tokens: int) -> list:
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        sentences = [s.strip() + '.' for s in sentences if s.strip()]
        
        chunks = []
        current_chunk = []
        current_token_count = 0
        
        for sentence in sentences:
            sentence_tokens = len(sentence.split())
            
            if current_token_count + sentence_tokens > max_tokens and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = [sentence]
                current_token_count = sentence_tokens
            else:
                current_chunk.append(sentence)
                current_token_count += sentence_tokens
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks

summarization_service = SummarizationService()
