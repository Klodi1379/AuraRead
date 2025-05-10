from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Create token for admin user
try:
    admin = User.objects.get(username='admin')
    token, created = Token.objects.get_or_create(user=admin)
    if created:
        print(f"Token created for admin: {token.key}")
    else:
        print(f"Token already exists for admin: {token.key}")
except User.DoesNotExist:
    print("Admin user does not exist")
