from django.db import models
from documents.models import Document
from django.contrib.auth.models import User


class DocumentSummary(models.Model):
    """Generated AI summaries for documents"""
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='ai_summary')
    summary = models.TextField()
    key_points = models.JSONField(default=list)
    generated_at = models.DateTimeField(auto_now_add=True)
    model_used = models.CharField(max_length=50, default='gpt-3.5-turbo')
    confidence_score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Summary for {self.document.title}"


class DocumentTags(models.Model):
    """AI-generated tags for documents"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='ai_tags')
    tag = models.CharField(max_length=50)
    confidence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['document', 'tag']

    def __str__(self):
        return f"{self.tag} ({self.confidence:.2f})"


class ReadingAnalytics(models.Model):
    """Track user reading patterns for AI optimization"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    reading_speed_wpm = models.FloatField(null=True)
    preferred_voice = models.CharField(max_length=100, blank=True)
    preferred_speed = models.FloatField(default=1.0)
    total_reading_time = models.DurationField(null=True)
    last_position = models.IntegerField(default=0)
    completion_percentage = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'document']
