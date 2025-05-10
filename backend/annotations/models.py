from django.db import models
from django.contrib.auth.models import User
from documents.models import Document

class Annotation(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='annotations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='annotations')
    # Përdorim akoma offsets, por duhet të kihet parasysh që këto i referohen tekstit të ekstraktuar në kohë reale
    start_offset = models.IntegerField()
    end_offset = models.IntegerField()
    selected_text = models.TextField()
    note = models.TextField(blank=True, null=True)
    highlight_color = models.CharField(max_length=20, default='yellow')
    page_number = models.IntegerField(default=1)  # Shtojmë numrin e faqes për pozicionim më të mirë
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document.title} - {self.selected_text[:50]}"
