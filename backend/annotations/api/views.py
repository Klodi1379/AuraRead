from rest_framework import viewsets, permissions
from annotations.models import Annotation
from annotations.api.serializers import AnnotationSerializer

class AnnotationViewSet(viewsets.ModelViewSet):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get the document_id from the URL if provided
        document_id = self.request.query_params.get('document', None)
        
        queryset = Annotation.objects.filter(user=self.request.user)
        
        if document_id:
            queryset = queryset.filter(document_id=document_id)
            
        return queryset
