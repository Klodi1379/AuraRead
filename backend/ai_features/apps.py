"""
AI Features App for AuraRead
Provides document analysis, summarization, and intelligent features
"""
from django.apps import AppConfig


class AiFeaturesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_features'
    verbose_name = 'AI Features'
