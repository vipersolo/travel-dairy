from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    # Login endpoint (Returns Access & Refresh tokens)
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Refresh endpoint (Trade a valid Refresh token for a new Access token)
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]