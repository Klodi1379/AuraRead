from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from annotations.models import Annotation
from annotations.api.serializers import AnnotationSerializer
import logging

# Get a logger
logger = logging.getLogger(__name__)

class AnnotationViewSet(viewsets.ModelViewSet):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get the document_id from the URL if provided
        document_id = self.request.query_params.get('document', None)

        logger.info(f"Getting annotations for user: {self.request.user.username}, document_id: {document_id}")

        queryset = Annotation.objects.filter(user=self.request.user)

        if document_id:
            queryset = queryset.filter(document_id=document_id)

        logger.info(f"Found {queryset.count()} annotations")
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"Returning {len(serializer.data)} annotations")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing annotations: {str(e)}")
            return Response(
                {"error": f"Error listing annotations: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating annotation: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Annotation created successfully: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            logger.error(f"Error creating annotation: {str(e)}")
            return Response(
                {"error": f"Error creating annotation: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
