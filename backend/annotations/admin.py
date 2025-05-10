from django.contrib import admin
from .models import Annotation

@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'selected_text', 'created_at')
    search_fields = ('selected_text', 'note')
    list_filter = ('created_at',)
