from rest_framework import serializers
from documents.models import Document

class DocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'file_url', 'uploaded_at', 'language']
        read_only_fields = ['uploaded_at', 'file_url']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None
