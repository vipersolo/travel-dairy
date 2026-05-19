from rest_framework import permissions

class IsModerator(permissions.BasePermission):
    """
    Allows access only to authenticated users with the MODERATOR role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'MODERATOR')
    

class IsModeratorOrReadOnly(permissions.BasePermission):
    """
    Public users can READ (GET).
    Only MODERATORS can WRITE (POST, PUT, DELETE).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'MODERATOR')