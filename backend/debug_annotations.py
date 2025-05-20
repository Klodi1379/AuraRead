"""
Debug script to check annotations in the database
"""
import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auraread.settings')
django.setup()

from django.contrib.auth.models import User
from documents.models import Document
from annotations.models import Annotation

def list_all_annotations():
    """List all annotations in the database"""
    print("\n=== All Annotations ===")
    annotations = Annotation.objects.all()
    
    if not annotations:
        print("No annotations found in the database.")
        return
    
    for annotation in annotations:
        print(f"ID: {annotation.id}")
        print(f"Document: {annotation.document.title} (ID: {annotation.document.id})")
        print(f"User: {annotation.user.username}")
        print(f"Text: '{annotation.selected_text[:50]}...' if len(annotation.selected_text) > 50 else annotation.selected_text")
        print(f"Note: {annotation.note}")
        print(f"Offsets: {annotation.start_offset} - {annotation.end_offset}")
        print(f"Created: {annotation.created_at}")
        print("-" * 50)

def list_annotations_by_document(document_id):
    """List annotations for a specific document"""
    try:
        document = Document.objects.get(id=document_id)
        print(f"\n=== Annotations for Document: {document.title} (ID: {document_id}) ===")
        
        annotations = Annotation.objects.filter(document_id=document_id)
        
        if not annotations:
            print(f"No annotations found for document ID {document_id}.")
            return
        
        for annotation in annotations:
            print(f"ID: {annotation.id}")
            print(f"User: {annotation.user.username}")
            print(f"Text: '{annotation.selected_text[:50]}...' if len(annotation.selected_text) > 50 else annotation.selected_text")
            print(f"Note: {annotation.note}")
            print(f"Offsets: {annotation.start_offset} - {annotation.end_offset}")
            print(f"Created: {annotation.created_at}")
            print("-" * 50)
    
    except Document.DoesNotExist:
        print(f"Document with ID {document_id} does not exist.")

def create_test_annotation(document_id, user_id):
    """Create a test annotation for debugging"""
    try:
        document = Document.objects.get(id=document_id)
        user = User.objects.get(id=user_id)
        
        annotation = Annotation.objects.create(
            document=document,
            user=user,
            start_offset=0,
            end_offset=20,
            selected_text="This is a test annotation",
            note="Created for debugging purposes",
            highlight_color="yellow"
        )
        
        print(f"\n=== Created Test Annotation ===")
        print(f"ID: {annotation.id}")
        print(f"Document: {document.title} (ID: {document.id})")
        print(f"User: {user.username}")
        print(f"Text: {annotation.selected_text}")
        print(f"Note: {annotation.note}")
        print(f"Offsets: {annotation.start_offset} - {annotation.end_offset}")
        print(f"Created: {annotation.created_at}")
        
    except Document.DoesNotExist:
        print(f"Document with ID {document_id} does not exist.")
    except User.DoesNotExist:
        print(f"User with ID {user_id} does not exist.")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        # No arguments, list all annotations
        list_all_annotations()
    elif len(sys.argv) == 2:
        # One argument, list annotations for a specific document
        try:
            document_id = int(sys.argv[1])
            list_annotations_by_document(document_id)
        except ValueError:
            print("Please provide a valid document ID (integer).")
    elif len(sys.argv) == 4 and sys.argv[1] == "create":
        # Create a test annotation
        try:
            document_id = int(sys.argv[2])
            user_id = int(sys.argv[3])
            create_test_annotation(document_id, user_id)
        except ValueError:
            print("Please provide valid document and user IDs (integers).")
    else:
        print("Usage:")
        print("  python debug_annotations.py                   # List all annotations")
        print("  python debug_annotations.py <document_id>     # List annotations for a specific document")
        print("  python debug_annotations.py create <document_id> <user_id>  # Create a test annotation")
