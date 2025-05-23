from django.urls import path, include
from rest_framework.routers import DefaultRouter
from annotations.api.views import AnnotationViewSet

router = DefaultRouter()
router.register(r'annotations', AnnotationViewSet, basename='annotation')

urlpatterns = [
    path('', include(router.urls)),
]
