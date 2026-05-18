from rest_framework import permissions

class IsModerator(permissions.BasePermission):
    """
    Allows access only to authenticated users with the MODERATOR role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'MODERATOR')