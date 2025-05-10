from django.contrib.auth.models import User
from django.core.management import setup_environ
import sys
import os

# Add the project path to sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Import settings
from auraread import settings
setup_environ(settings)

# Set admin password
admin = User.objects.get(username='admin')
admin.set_password('admin123')
admin.save()

print("Admin password set to 'admin123'")
