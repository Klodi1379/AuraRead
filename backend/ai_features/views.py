"""
AI Features Views for document analysis
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
import logging

from documents.models import Document
from .models import DocumentSummary, DocumentTags
from .services import ai_service

logger = logging.getLogger(__name__)


class AIFeaturesViewSet(viewsets.ViewSet):
    """ViewSet për AI features"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def summarize(self, request):
        """Krijon përmbledhje me AI"""
        try:
            document_id = request.data.get('document_id')
            text = request.data.get('text', '')
            
            if not document_id or not text:
                return Response(
                    {'error': 'document_id dhe text janë të domosdoshëm'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            document = get_object_or_404(Document, id=document_id, user=request.user)
            
            # Kontrollo nëse ekziston tashmë përmbledhja
            existing_summary = DocumentSummary.objects.filter(document=document).first()
            if existing_summary:
                return Response({
                    'summary': existing_summary.summary,
                    'key_points': existing_summary.key_points,
                    'generated_at': existing_summary.generated_at,
                    'cached': True
                })
            
            # Gjeneroj përmbledhje të re
            summary_result = ai_service.generate_summary(text)
            key_points = ai_service.extract_key_points(text)
            
            if 'error' in summary_result:
                return Response(summary_result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Ruaj në bazën e të dhënave
            summary_obj = DocumentSummary.objects.create(
                document=document,
                summary=summary_result['summary'],
                key_points=key_points,
                model_used=summary_result.get('model_used', 'unknown')
            )
            
            return Response({
                'summary': summary_obj.summary,
                'key_points': summary_obj.key_points,
                'generated_at': summary_obj.generated_at,
                'cached': False
            })
            
        except Exception as e:
            logger.error(f"Error në AI summarization: {e}")
            return Response(
                {'error': f'Gabim në gjenerimin e përmbledhjes: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def question(self, request):
        """Përgjigjet pyetjeve rreth dokumentit"""
        try:
            document_id = request.data.get('document_id')
            question = request.data.get('question', '')
            text = request.data.get('text', '')
            
            if not all([document_id, question, text]):
                return Response(
                    {'error': 'document_id, question dhe text janë të domosdoshëm'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            document = get_object_or_404(Document, id=document_id, user=request.user)
            
            # Gjeneroj përgjigje
            answer = ai_service.answer_question(text, question)
            
            return Response({
                'question': question,
                'answer': answer,
                'document_title': document.title
            })
            
        except Exception as e:
            logger.error(f"Error në AI question answering: {e}")
            return Response(
                {'error': f'Gabim në përgjigjen e pyetjes: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def generate_tags(self, request):
        """Gjeneroj tag-e automatike për dokumentin"""
        try:
            document_id = request.data.get('document_id')
            text = request.data.get('text', '')
            
            if not document_id or not text:
                return Response(
                    {'error': 'document_id dhe text janë të domosdoshëm'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            document = get_object_or_404(Document, id=document_id, user=request.user)
            
            # Gjeneroj tag-e
            tags_data = ai_service.generate_tags(text)
            
            # Ruaj tag-et në bazën e të dhënave
            saved_tags = []
            for tag_info in tags_data:
                tag_obj, created = DocumentTags.objects.get_or_create(
                    document=document,
                    tag=tag_info['tag'],
                    defaults={'confidence': tag_info['confidence']}
                )
                saved_tags.append({
                    'tag': tag_obj.tag,
                    'confidence': tag_obj.confidence,
                    'created': created
                })
            
            return Response({'tags': saved_tags})
            
        except Exception as e:
            logger.error(f"Error në AI tag generation: {e}")
            return Response(
                {'error': f'Gabim në gjenerimin e tag-eve: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
