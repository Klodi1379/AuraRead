from annotations.models import Annotation

# Fix existing annotations by setting page_number=1 for all
annotations = Annotation.objects.all()
for annotation in annotations:
    annotation.page_number = 1
    annotation.save()

print(f"Fixed {annotations.count()} annotations")
