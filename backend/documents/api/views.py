from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse, FileResponse
from django.conf import settings
from gtts import gTTS
import os
import tempfile
import logging

from documents.models import Document
from documents.api.serializers import DocumentSerializer
from documents.pdf_utils import extract_text_from_pdf, get_pdf_info
from documents.tts_service import tts_service
from documents.enhanced_tts_service import enhanced_tts_service

# Get an instance of a logger
logger = logging.getLogger(__name__)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        logger.debug("Getting queryset for user: %s", self.request.user)
        return Document.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        try:
            logger.debug("Listing documents for user: %s", request.user)
            queryset = self.get_queryset()
            logger.debug("Found %d documents", queryset.count())
            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error("Error listing documents: %s", str(e), exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            logger.debug("Retrieving document with pk: %s", pk)
            instance = self.get_object()
            serializer = self.get_serializer(instance, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error("Error retrieving document: %s", str(e), exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        """
        Create a new document (without text extraction).
        """
        try:
            logger.debug("Creating document for user: %s", self.request.user)
            document = serializer.save(user=self.request.user)
            logger.debug("Document created with ID: %s", document.id)
            return document
        except Exception as e:
            logger.error("Error creating document: %s", str(e), exc_info=True)
            raise

    @action(detail=True, methods=['get'])
    def extract_text(self, request, pk=None):
        """
        Extract text from a PDF document on demand.
        """
        try:
            logger.debug("Extracting text from document with pk: %s", pk)
            document = self.get_object()

            # Check if file exists
            if not document.file or not os.path.exists(document.file.path):
                logger.error("PDF file not found: %s", document.file.path if document.file else "None")
                return Response({
                    'error': 'PDF file not found or could not be accessed'
                }, status=status.HTTP_404_NOT_FOUND)

            # Extract text from the PDF
            logger.debug("Extracting text from file: %s", document.file.path)
            extracted_text = extract_text_from_pdf(document.file.path)

            # Return the extracted text
            return Response({
                'text': extracted_text
            })
        except Exception as e:
            logger.error("Error extracting text: %s", str(e), exc_info=True)
            return Response({
                'error': f'Error extracting text: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def available_voices(self, request):
        """
        Get a list of available TTS voices from all engines.
        """
        try:
            logger.info("Getting available TTS voices")

            # Try to get voices from the enhanced TTS service first
            try:
                voices = enhanced_tts_service.get_available_voices()
                # Add online voices
                voices['online'] = [
                    {'id': 'voicerss_en-us', 'name': 'English (US)', 'language': 'en-us'},
                    {'id': 'voicerss_en-gb', 'name': 'English (UK)', 'language': 'en-gb'},
                    {'id': 'voicerss_fr-fr', 'name': 'French', 'language': 'fr-fr'},
                    {'id': 'voicerss_de-de', 'name': 'German', 'language': 'de-de'},
                    {'id': 'voicerss_es-es', 'name': 'Spanish', 'language': 'es-es'},
                    {'id': 'voicerss_it-it', 'name': 'Italian', 'language': 'it-it'},
                ]
                logger.info(f"Found {len(voices['windows_sapi'])} Windows SAPI voices, {len(voices['pyttsx3'])} pyttsx3 voices, and {len(voices['online'])} online voices")
            except Exception as e:
                logger.warning(f"Enhanced TTS service failed to get voices: {str(e)}, falling back to original TTS service")
                voices = tts_service.get_available_voices()

            return Response(voices)
        except Exception as e:
            logger.error("Error getting available voices: %s", str(e), exc_info=True)
            return Response({
                'error': f'Error getting available voices: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def tts(self, request, pk=None):
        """
        Endpoint to convert text to speech.
        Expects 'text' parameter in the request data.
        """
        try:
            logger.info("Converting text to speech for document with pk: %s", pk)
            document = self.get_object()

            # Log authentication information
            logger.info("User: %s, Auth: %s", request.user.username, request.auth)

            # Handle both JSON and form data
            if isinstance(request.data, dict):
                text = request.data.get('text', '')
                language = request.data.get('language', '')
                prefer_offline = request.data.get('prefer_offline', True)
                voice_name = request.data.get('voice_name', None)
            else:
                # For multipart/form-data
                text = request.data.get('text', '')
                language = request.data.get('language', '')
                prefer_offline = request.data.get('prefer_offline', True)
                voice_name = request.data.get('voice_name', None)

                # Convert string 'true'/'false' to boolean if needed
                if isinstance(prefer_offline, str):
                    prefer_offline = prefer_offline.lower() == 'true'

            logger.info("Received text for TTS: %s (length: %d chars)",
                       text[:50] + "..." if len(text) > 50 else text,
                       len(text))

            if not text:
                logger.warning("No text provided for TTS conversion")
                return Response({'error': 'No text provided'}, status=status.HTTP_400_BAD_REQUEST)

            # Use provided language or fall back to document language
            tts_language = language if language else document.language
            logger.info("Using language for TTS: %s", tts_language)
            logger.info("Using voice name: %s", voice_name)
            logger.info("Prefer offline TTS: %s", prefer_offline)

            # Create a temporary file for the audio
            temp_filename = None
            try:
                logger.info("Starting TTS conversion with service...")

                # Try the enhanced TTS service first, fall back to the original if it fails
                try:
                    logger.info("Using enhanced TTS service...")
                    temp_filename = enhanced_tts_service.text_to_speech(
                        text=text,
                        language=tts_language,
                        prefer_offline=prefer_offline,
                        voice_name=voice_name
                    )
                    logger.info("Enhanced TTS conversion successful, generated file: %s", temp_filename)
                except Exception as e:
                    logger.warning(f"Enhanced TTS service failed: {str(e)}, falling back to original TTS service")
                    # Fall back to the original TTS service
                    temp_filename = tts_service.text_to_speech(
                        text=text,
                        language=tts_language,
                        prefer_offline=prefer_offline,
                        voice_name=voice_name
                    )
                    logger.info("Original TTS conversion successful, generated file: %s", temp_filename)

                # Check that the file exists and has content
                if not os.path.exists(temp_filename) or os.path.getsize(temp_filename) == 0:
                    raise Exception("Generated audio file is empty or does not exist")

                # Read the file content
                with open(temp_filename, 'rb') as f:
                    file_content = f.read()

                # Clean up the temporary file
                try:
                    os.remove(temp_filename)
                except:
                    pass

                # Determine content type based on file extension
                content_type = 'audio/mpeg'
                if temp_filename.endswith('.wav'):
                    content_type = 'audio/wav'

                # Return the file content directly
                response = HttpResponse(
                    content=file_content,
                    content_type=content_type
                )

                # Set filename based on content type
                filename = "speech.mp3" if content_type == 'audio/mpeg' else "speech.wav"
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
                return response

            except Exception as e:
                logger.error("Error in TTS file generation: %s", str(e), exc_info=True)
                if temp_filename and os.path.exists(temp_filename):
                    try:
                        os.remove(temp_filename)
                        logger.info("Cleaned up temporary file after error: %s", temp_filename)
                    except Exception as cleanup_error:
                        logger.error("Failed to clean up temporary file: %s", str(cleanup_error))

                # Check if it's a rate limiting error
                error_message = str(e)
                if "429" in error_message or "Too Many Requests" in error_message:
                    logger.warning("TTS rate limit reached")
                    return Response({
                        'error': 'TTS rate limit reached. Please try again later or with a smaller text selection.'
                    }, status=status.HTTP_429_TOO_MANY_REQUESTS)

                raise
        except Exception as e:
            logger.error("Error in TTS conversion: %s", str(e), exc_info=True)

            # Provide more specific error messages based on the exception
            error_message = str(e)
            if "No such file or directory" in error_message:
                return Response({
                    'error': 'TTS engine not properly installed or configured. Please check server logs.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            elif "voice" in error_message.lower():
                return Response({
                    'error': 'Selected voice not available or not properly configured.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({
                    'error': f'Error generating speech: {error_message}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
