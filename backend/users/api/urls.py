from django.urls import path
from .views import UserDetailView, RegisterView, LoginView, LogoutView

urlpatterns = [
    path('users/me/', UserDetailView.as_view(), name='user-detail'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]