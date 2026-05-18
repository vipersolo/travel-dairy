from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Manager
from .serializers import ManagerVerificationSerializer
from .permissions import IsModerator
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import BaseUser
from .serializers import RegisterSerializer





class ModeratorManagerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint: /api/v1/users/moderator/managers/
    Strictly for Moderators to view and verify Business Accounts.
    """
    # Use select_related to prevent N+1 database query issues
    queryset = Manager.objects.select_related('user').all().order_by('-user__date_joined')
    serializer_class = ManagerVerificationSerializer
    permission_classes = [IsModerator]

    @action(detail=True, methods=['post'])
    def toggle_verification(self, request, pk=None):
        """
        Flips the is_verified boolean for a specific manager.
        """
        manager = self.get_object()
        
        # Toggle the boolean state
        manager.is_verified = not manager.is_verified
        manager.save()
        
        return Response({
            "message": "Verification status updated.",
            "is_verified": manager.is_verified
        }, status=status.HTTP_200_OK)
    




class RegisterView(generics.CreateAPIView):
    """
    Endpoint: POST /api/v1/users/register/
    Public endpoint for new users to create an account.
    """
    queryset = BaseUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer