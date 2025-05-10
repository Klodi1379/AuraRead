from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.api.urls')),  # Auth endpoints
    path('api/', include('documents.api.urls')),
    path('api/', include('annotations.api.urls')),
    path('api-auth/', include('rest_framework.urls')),
    
    # Serve media files directly
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
