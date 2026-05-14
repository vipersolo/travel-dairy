from rest_framework import permissions

class IsManagerOrReadOnly(permissions.BasePermission):
    """
    Anyone can view (GET) the list of accommodations/packages.
    Only users with the 'MANAGER' role can create (POST) or edit (PUT/PATCH).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == 'MANAGER')

class IsCitizen(permissions.BasePermission):
    """
    Only standard travelers ('CITIZEN') can make bookings or leave reviews.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CITIZEN')