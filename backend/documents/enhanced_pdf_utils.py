"""
Enhanced PDF utilities with OCR and advanced text extraction
"""
import os
import io
import logging
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import cv2
import numpy as np
from typing import Dict, List, Tuple, Optional

logger = logging.getLogger(__name__)


class EnhancedPDFProcessor:
    """Advanced PDF processing with OCR capabilities"""

    def __init__(self):
        self.ocr_available = self._check_tesseract()

    def _check_tesseract(self) -> bool:
        """Check if Tesseract OCR is available"""
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception as e:
            logger.warning(f"Tesseract OCR not available: {e}")
            return False

    def extract_text_with_coordinates(self, pdf_path: str) -> Dict:
        """Extract text with coordinate information for better positioning"""
        try:
            doc = fitz.open(pdf_path)
            pages_data = []

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Get text with coordinates
                text_dict = page.get_text("dict")
                blocks = []
                
                for block in text_dict["blocks"]:
                    if "lines" in block:  # Text block
                        block_text = ""
                        for line in block["lines"]:
                            for span in line["spans"]:
                                block_text += span["text"]
                        
                        blocks.append({
                            "text": block_text,
                            "bbox": block["bbox"],  # [x0, y0, x1, y1]
                            "type": "text"
                        })
                    else:  # Image block
                        blocks.append({
                            "bbox": block["bbox"],
                            "type": "image"
                        })

                pages_data.append({
                    "page_number": page_num + 1,
                    "blocks": blocks,
                    "page_size": page.rect
                })

            doc.close()
            return {
                "pages": pages_data,
                "total_pages": len(doc),
                "extraction_method": "pymupdf_with_coordinates"
            }

        except Exception as e:
            logger.error(f"Error extracting text with coordinates: {e}")
            return {"error": str(e)}

    def extract_with_ocr(self, pdf_path: str, lang: str = 'eng') -> Dict:
        """Extract text using OCR for scanned documents"""
        if not self.ocr_available:
            return {"error": "OCR not available"}

        try:
            doc = fitz.open(pdf_path)
            pages_text = []

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Convert page to image
                mat = fitz.Matrix(2, 2)  # 2x zoom for better OCR
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("png")
                
                # OCR with PIL and pytesseract
                img = Image.open(io.BytesIO(img_data))
                
                # Enhance image for better OCR
                img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
                gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
                
                # Apply image preprocessing
                _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                
                # OCR configuration
                config = '--oem 3 --psm 6'  # Use LSTM OCR Engine Mode with uniform text block
                
                # Extract text
                ocr_text = pytesseract.image_to_string(
                    Image.fromarray(binary), 
                    lang=lang, 
                    config=config
                )

                pages_text.append({
                    "page_number": page_num + 1,
                    "text": ocr_text,
                    "confidence": self._calculate_ocr_confidence(binary, lang, config)
                })

            doc.close()
            return {
                "pages": pages_text,
                "total_pages": len(doc),
                "extraction_method": "ocr",
                "language": lang
            }

        except Exception as e:
            logger.error(f"Error in OCR extraction: {e}")
            return {"error": str(e)}

    def _calculate_ocr_confidence(self, image: np.ndarray, lang: str, config: str) -> float:
        """Calculate average confidence score for OCR"""
        try:
            data = pytesseract.image_to_data(
                Image.fromarray(image), 
                lang=lang, 
                config=config, 
                output_type=pytesseract.Output.DICT
            )
            
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            return sum(confidences) / len(confidences) if confidences else 0.0
            
        except Exception:
            return 0.0

    def detect_document_type(self, pdf_path: str) -> str:
        """Detect if document is text-based or scanned"""
        try:
            doc = fitz.open(pdf_path)
            
            # Check first few pages
            text_ratio = 0
            pages_to_check = min(3, len(doc))
            
            for i in range(pages_to_check):
                page = doc.load_page(i)
                text = page.get_text().strip()
                images = page.get_images()
                
                if len(text) > 500:  # Substantial text content
                    text_ratio += 1
                elif len(images) > 0:  # Has images, likely scanned
                    text_ratio -= 0.5

            doc.close()
            
            if text_ratio > pages_to_check * 0.5:
                return "text_based"
            else:
                return "scanned"

        except Exception:
            return "unknown"

    def smart_extract_text(self, pdf_path: str, force_ocr: bool = False) -> Dict:
        """Intelligently choose extraction method based on document type"""
        try:
            # First, try standard extraction
            if not force_ocr:
                doc_type = self.detect_document_type(pdf_path)
                
                if doc_type == "text_based":
                    logger.info("Using standard text extraction")
                    return self.extract_text_with_coordinates(pdf_path)
            
            # If document is scanned or force_ocr is True, use OCR
            if self.ocr_available:
                logger.info("Using OCR extraction")
                return self.extract_with_ocr(pdf_path)
            else:
                # Fallback to basic extraction
                logger.warning("OCR not available, falling back to basic extraction")
                return self.extract_text_with_coordinates(pdf_path)

        except Exception as e:
            logger.error(f"Error in smart text extraction: {e}")
            return {"error": str(e)}


# Enhanced function to replace the original
def extract_text_from_pdf(pdf_path: str, use_ocr: bool = False) -> str:
    """Enhanced text extraction with OCR support"""
    processor = EnhancedPDFProcessor()
    
    result = processor.smart_extract_text(pdf_path, force_ocr=use_ocr)
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    # Combine all page texts
    full_text = ""
    if "pages" in result:
        for page_data in result["pages"]:
            if isinstance(page_data, dict):
                if "text" in page_data:  # OCR result
                    full_text += f"\n--- Page {page_data['page_number']} ---\n"
                    full_text += page_data["text"] + "\n"
                elif "blocks" in page_data:  # Coordinate result
                    full_text += f"\n--- Page {page_data['page_number']} ---\n"
                    for block in page_data["blocks"]:
                        if block["type"] == "text":
                            full_text += block["text"] + "\n"
    
    return full_text


# Create processor instance
pdf_processor = EnhancedPDFProcessor()
