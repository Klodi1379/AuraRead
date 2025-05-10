from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .serializers import UserSerializer, UserRegistrationSerializer

class UserDetailView(generics.RetrieveAPIView):
    """
    Get user details
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class RegisterView(generics.CreateAPIView):
    """
    Register a new user
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Login a user and return a token
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response({'error': 'Invalid credentials'}, 
                            status=status.HTTP_401_UNAUTHORIZED)
        
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })


class LogoutView(APIView):
    """
    Logout a user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Delete the token to logout
        try:
            request.user.auth_token.delete()
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'success': 'Successfully logged out'}, status=status.HTTP_200_OK)