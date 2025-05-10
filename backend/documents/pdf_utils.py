"""
Utility functions for working with PDF files.
"""
import os
import io
import subprocess
import tempfile
import fitz  # PyMuPDF
import logging

# Set up logging
logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file using PyMuPDF (fitz).

    This function extracts all text content from each page of the PDF,
    preserving the layout as much as possible.

    Args:
        pdf_path (str): Path to the PDF file

    Returns:
        str: Extracted text from the PDF
    """
    try:
        logger.info(f"Extracting text from PDF: {pdf_path}")

        # Check if file exists
        if not os.path.exists(pdf_path):
            logger.error(f"PDF file not found: {pdf_path}")
            return "Error: PDF file not found"

        # Check if it's a valid PDF
        with open(pdf_path, 'rb') as file:
            header = file.read(5)
            if header != b'%PDF-':
                logger.error(f"Invalid PDF file: {pdf_path}")
                return "Invalid PDF file"

        # Open the PDF file with PyMuPDF
        doc = fitz.open(pdf_path)
        logger.info(f"PDF opened successfully. Pages: {len(doc)}")

        # Extract metadata
        metadata = doc.metadata
        title = metadata.get('title', os.path.basename(pdf_path))

        # Start with the title
        full_text = f"Title: {title}\n\n"

        # Extract text from each page
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)

            # Get text with layout preservation
            text = page.get_text("text")

            # Add page number and text
            full_text += f"--- Page {page_num + 1} ---\n\n"
            full_text += text
            full_text += "\n\n"

            # Extract images if needed (commented out for now)
            # images = page.get_images(full=True)
            # if images:
            #     full_text += f"[This page contains {len(images)} image(s)]\n\n"

        # Close the document
        doc.close()

        logger.info(f"Text extraction completed. Extracted {len(full_text)} characters")
        return full_text

    except Exception as e:
        logger.error(f"Error extracting text: {str(e)}", exc_info=True)
        return f"Error extracting text: {str(e)}"

def get_pdf_info(pdf_path):
    """
    Get detailed information about a PDF file using PyMuPDF.

    Args:
        pdf_path (str): Path to the PDF file

    Returns:
        dict: PDF metadata and structure information
    """
    try:
        logger.info(f"Getting PDF info for: {pdf_path}")

        # Basic file info
        file_size = os.path.getsize(pdf_path)
        file_name = os.path.basename(pdf_path)

        # Open the PDF with PyMuPDF
        doc = fitz.open(pdf_path)

        # Get metadata
        metadata = doc.metadata

        # Get page count and dimensions of first page
        page_count = len(doc)
        first_page = doc.load_page(0) if page_count > 0 else None
        page_dimensions = first_page.rect.width, first_page.rect.height if first_page else (0, 0)

        # Count images in the document
        image_count = 0
        for page_num in range(page_count):
            page = doc.load_page(page_num)
            image_count += len(page.get_images())

        # Close the document
        doc.close()

        return {
            'file_name': file_name,
            'file_size': file_size,
            'file_size_formatted': format_file_size(file_size),
            'page_count': page_count,
            'title': metadata.get('title', ''),
            'author': metadata.get('author', ''),
            'subject': metadata.get('subject', ''),
            'keywords': metadata.get('keywords', ''),
            'creator': metadata.get('creator', ''),
            'producer': metadata.get('producer', ''),
            'creation_date': metadata.get('creationDate', ''),
            'modification_date': metadata.get('modDate', ''),
            'page_dimensions': f"{page_dimensions[0]:.2f} x {page_dimensions[1]:.2f} points",
            'image_count': image_count,
        }
    except Exception as e:
        logger.error(f"Error getting PDF info: {str(e)}", exc_info=True)
        return {'error': str(e)}

def format_file_size(size_bytes):
    """
    Format file size from bytes to a human-readable format.

    Args:
        size_bytes (int): File size in bytes

    Returns:
        str: Formatted file size (e.g., "2.5 MB")
    """
    # 2^10 = 1024
    power = 2**10
    n = 0
    power_labels = {0: 'B', 1: 'KB', 2: 'MB', 3: 'GB', 4: 'TB'}

    while size_bytes > power and n < 4:
        size_bytes /= power
        n += 1

    return f"{size_bytes:.2f} {power_labels[n]}"