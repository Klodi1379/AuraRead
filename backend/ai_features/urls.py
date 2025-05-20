"""
URL routing për AI features
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIFeaturesViewSet

router = DefaultRouter()
router.register(r'ai', AIFeaturesViewSet, basename='ai')

urlpatterns = [
    path('api/', include(router.urls)),
]
