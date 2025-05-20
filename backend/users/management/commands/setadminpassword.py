from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Creates admin user or resets admin password'

    def handle(self, *args, **options):
        try:
            # Try to get or create admin user
            admin_user, created = User.objects.get_or_create(
                username='admin',
                defaults={
                    'email': 'admin@auraread.com',
                    'is_staff': True,
                    'is_superuser': True,
                }
            )
            
            # Set password
            admin_user.set_password('admin123')
            admin_user.save()
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS('[OK] Admin user created successfully!')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS('[OK] Admin password updated successfully!')
                )
                
            self.stdout.write('Username: admin')
            self.stdout.write('Password: admin123')
            self.stdout.write('URL: http://localhost:8000/admin/')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'[ERROR] Error creating admin user: {e}')
            )
