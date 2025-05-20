"""
AI Service for document analysis and summarization
OPTIONAL: Requires OpenAI API key for full functionality
"""
import logging
from typing import Dict, List, Optional
from django.conf import settings
import re

logger = logging.getLogger(__name__)

# Optional imports - will work without them but with limited functionality
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not installed. AI features will be limited.")

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    logger.warning("Sentence transformers not available. Semantic search disabled.")


class AIDocumentService:
    """Service for AI-powered document analysis"""

    def __init__(self):
        self.openai_client = None
        self.embedding_model = None
        
        # Initialize OpenAI if available and key is configured
        if OPENAI_AVAILABLE and hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
            self.openai_client = openai
            logger.info("OpenAI client initialized successfully")
        else:
            logger.warning("OpenAI not available. AI features will use basic fallbacks.")
        
        # Initialize embedding model for semantic search
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("Sentence transformer model loaded successfully")
            except Exception as e:
                logger.warning(f"Could not load embedding model: {e}")
        
    def generate_summary(self, text: str, max_words: int = 200) -> Dict[str, any]:
        """Generate AI summary of document text"""
        if not self.openai_client:
            # Fallback: Extract first few sentences as summary
            sentences = text.split('.')[:5]
            summary = '. '.join(sentences).strip() + '.'
            return {
                "summary": summary,
                "model_used": "basic_extraction",
                "word_count": len(summary.split()),
                "note": "OpenAI not available. Using basic text extraction."
            }
        
        try:
            # Truncate text if too long (GPT token limits)
            max_chars = 12000
            if len(text) > max_chars:
                text = text[:max_chars] + "..."

            prompt = f"""
            Please provide a comprehensive summary of the following document in {max_words} words or less.
            Include the main points and key concepts.
            
            Text: {text}
            
            Summary:
            """

            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates concise, accurate summaries."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_words * 2,
                temperature=0.3
            )

            summary = response.choices[0].message.content.strip()
            
            return {
                "summary": summary,
                "model_used": "gpt-3.5-turbo",
                "word_count": len(summary.split())
            }

        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            # Fallback to basic extraction on error
            sentences = text.split('.')[:3]
            summary = '. '.join(sentences).strip() + '.'
            return {
                "summary": summary,
                "model_used": "fallback",
                "error": str(e)
            }

    def extract_key_points(self, text: str, num_points: int = 5) -> List[str]:
        """Extract key points from document"""
        if not self.openai_client:
            # Fallback: Extract sentences with keywords
            sentences = text.split('.')
            key_sentences = []
            keywords = ['important', 'key', 'main', 'significant', 'conclusion', 'result']
            
            for sentence in sentences[:20]:  # Check first 20 sentences
                if any(keyword in sentence.lower() for keyword in keywords):
                    key_sentences.append(sentence.strip())
                if len(key_sentences) >= num_points:
                    break
            
            return key_sentences[:num_points] if key_sentences else sentences[:num_points]

        try:
            prompt = f"""
            Extract the {num_points} most important key points from this text.
            Format as a simple list, one point per line.
            
            Text: {text[:8000]}
            
            Key Points:
            """

            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert at identifying key information."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.2
            )

            content = response.choices[0].message.content.strip()
            points = [line.strip().lstrip('•-*').strip() 
                     for line in content.split('\n') 
                     if line.strip() and not line.strip().startswith('Key Points:')]
            
            return points[:num_points]

        except Exception as e:
            logger.error(f"Error extracting key points: {e}")
            # Fallback
            sentences = text.split('.')[:num_points]
            return [s.strip() for s in sentences if s.strip()]

    def generate_tags(self, text: str, max_tags: int = 10) -> List[Dict[str, any]]:
        """Generate relevant tags for the document"""
        if not self.openai_client:
            # Basic keyword extraction
            words = text.lower().split()
            word_freq = {}
            for word in words:
                if len(word) > 4 and word.isalpha():  # Only longer words
                    word_freq[word] = word_freq.get(word, 0) + 1
            
            # Get top words
            sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
            tags = [{"tag": word, "confidence": 0.5} for word, _ in sorted_words[:max_tags]]
            return tags

        try:
            prompt = f"""
            Generate {max_tags} relevant tags for this document.
            Tags should be single words or short phrases (2-3 words max).
            Format as comma-separated values.
            
            Text: {text[:6000]}
            
            Tags:
            """

            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert at document categorization and tagging."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.3
            )

            content = response.choices[0].message.content.strip()
            tags = [tag.strip().lower() for tag in content.split(',') if tag.strip()]
            
            return [{"tag": tag, "confidence": 0.8} for tag in tags[:max_tags]]

        except Exception as e:
            logger.error(f"Error generating tags: {e}")
            return []

    def answer_question(self, text: str, question: str) -> str:
        """Answer a question about the document"""
        if not self.openai_client:
            return "AI service not available. Please configure OpenAI API key for question answering."

        try:
            prompt = f"""
            Based on the following document, please answer the question.
            If the answer is not in the document, say "The information is not available in this document."
            
            Document: {text[:10000]}
            
            Question: {question}
            
            Answer:
            """

            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers questions based on provided documents."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.2
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error answering question: {e}")
            return f"Error processing question: {str(e)}"


# Create singleton instance
ai_service = AIDocumentService()
