from rest_framework import permissions


class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with the ADMIN role or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "ADMIN" or request.user.is_superuser)
        )


class IsTrainerUserRole(permissions.BasePermission):
    """
    Allows access to Trainers or Admins.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in ["TRAINER", "ADMIN"] or request.user.is_superuser)
        )


class IsStudentUserRole(permissions.BasePermission):
    """
    Allows access to Students or Admins.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in ["STUDENT", "ADMIN"] or request.user.is_superuser)
        )


class IsPlacementOfficerRole(permissions.BasePermission):
    """
    Allows access to Placement Officers or Admins.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in ["PLACEMENT", "ADMIN"] or request.user.is_superuser)
        )


class IsAlumniUserRole(permissions.BasePermission):
    """
    Allows access to Alumni or Admins.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in ["ALUMNI", "ADMIN"] or request.user.is_superuser)
        )


class IsSelfOrAdmin(permissions.BasePermission):
    """
    Allows access if the user is the owner of the object or is an Admin.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == "ADMIN" or request.user.is_superuser:
            return True
        if hasattr(obj, "user"):
            return obj.user == request.user
        return obj == request.user
