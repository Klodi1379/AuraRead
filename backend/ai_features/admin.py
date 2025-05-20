from django.contrib import admin
from .models import DocumentSummary, DocumentTags, ReadingAnalytics


@admin.register(DocumentSummary)
class DocumentSummaryAdmin(admin.ModelAdmin):
    list_display = ['document', 'generated_at', 'model_used', 'confidence_score']
    list_filter = ['model_used', 'generated_at']
    search_fields = ['document__title', 'summary']
    readonly_fields = ['generated_at']


@admin.register(DocumentTags)
class DocumentTagsAdmin(admin.ModelAdmin):
    list_display = ['document', 'tag', 'confidence', 'created_at']
    list_filter = ['tag', 'confidence', 'created_at']
    search_fields = ['document__title', 'tag']


@admin.register(ReadingAnalytics)
class ReadingAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['user', 'document', 'reading_speed_wpm', 'completion_percentage', 'updated_at']
    list_filter = ['completion_percentage', 'updated_at']
    search_fields = ['user__username', 'document__title']
    readonly_fields = ['created_at', 'updated_at']
