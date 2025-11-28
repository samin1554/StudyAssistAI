from transformers import pipeline
import logging
import random
import re
from app.models.request_models import Question
from app.config import MCQ_MODEL_NAME

logger = logging.getLogger(__name__)

class MCQGeneratorService:
    def __init__(self):
        self.model_name = MCQ_MODEL_NAME
        self.qa_pipeline = None
        self._load_model()

    def _load_model(self):
        try:
            logger.info(f"Loading QA model: {self.model_name}")
            self.qa_pipeline = pipeline("text2text-generation", model=self.model_name)
            logger.info("Model loaded")
        except Exception as e:
            logger.error(f"Model load failed: {e}")
            raise

    def generate_mcqs(self, text: str, num_questions: int = 10) -> list[Question]:
        if not text or not text.strip():
            logger.warning("Empty text provided")
            return []

        logger.info(f"Generating {num_questions} MCQs from {len(text)} chars")
        
        sentences = self._extract_key_sentences(text, num_questions * 2)
        all_questions = []
        
        for i, sentence in enumerate(sentences[:num_questions]):
            try:
                question = self._generate_single_mcq(sentence, text, i+1)
                if question:
                    all_questions.append(question)
                    logger.info(f"Generated question {i+1}/{num_questions}")
            except Exception as e:
                logger.error(f"Failed to generate question {i+1}: {e}")
                continue
        
        logger.info(f"Successfully generated {len(all_questions)} questions")
        return all_questions[:num_questions]

    def _generate_single_mcq(self, focus_sentence: str, full_text: str, question_num: int) -> Question:
        key_terms = self._extract_key_terms(focus_sentence)
        
        if not key_terms:
            return None
        
        answer_term = random.choice(key_terms)
        
        question_templates = [
            f"What is {answer_term}?",
            f"According to the text, what does {answer_term} refer to?",
            f"Which statement about {answer_term} is correct?",
            f"What is the main point about {answer_term}?",
        ]
        
        question_text = random.choice(question_templates)
        
        context_words = focus_sentence.split()
        answer_context = " ".join([w for w in context_words if answer_term.lower() in w.lower() or len(w) > 4][:8])
        
        if not answer_context:
            answer_context = answer_term
        
        distractors = self._generate_distractors(answer_context, full_text, key_terms)
        
        options = [answer_context] + distractors[:3]
        random.shuffle(options)
        
        correct_index = options.index(answer_context)
        correct_letter = chr(65 + correct_index)
        
        return Question(
            question=question_text,
            options=options,
            correct_option_index=correct_index,
            answer=f"{correct_letter}) {answer_context}"
        )

    def _extract_key_sentences(self, text: str, count: int) -> list[str]:
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
        
        sentences = sorted(sentences, key=lambda x: len(x.split()), reverse=True)
        
        return sentences[:count]

    def _extract_key_terms(self, sentence: str) -> list[str]:
        words = sentence.split()
        
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'being'}
        
        key_terms = []
        for i, word in enumerate(words):
            clean_word = re.sub(r'[^\w\s]', '', word)
            if len(clean_word) > 4 and clean_word.lower() not in stop_words:
                if i + 1 < len(words):
                    bigram = f"{clean_word} {words[i+1]}"
                    key_terms.append(bigram)
                key_terms.append(clean_word)
        
        return key_terms[:10]

    def _generate_distractors(self, correct_answer: str, full_text: str, key_terms: list[str]) -> list[str]:
        distractors = []
        
        sentences = re.split(r'[.!?]+', full_text)
        for sentence in sentences:
            words = sentence.split()
            if len(words) > 5:
                phrase = " ".join(words[:min(8, len(words))])
                if phrase != correct_answer and phrase not in distractors:
                    distractors.append(phrase)
                    if len(distractors) >= 3:
                        break
        
        while len(distractors) < 3:
            if key_terms:
                term = random.choice(key_terms)
                if term != correct_answer and term not in distractors:
                    distractors.append(term)
            else:
                distractors.append(f"Alternative option {len(distractors) + 1}")
        
        return distractors[:3]

mcq_service = MCQGeneratorService()
