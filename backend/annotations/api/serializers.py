from rest_framework import serializers
from annotations.models import Annotation

class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ['id', 'document', 'start_offset', 'end_offset', 'selected_text', 'note', 
                  'highlight_color', 'page_number', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
