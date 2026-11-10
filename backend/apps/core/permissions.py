from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Object-level permission: a user may only touch records they own.

    Queryset-level filtering (each viewset's get_queryset) already scopes
    results to request.user, so this is a defense-in-depth backstop rather
    than the primary access control - it protects against a future viewset
    forgetting to filter its queryset.
    """

    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, "user", None)
        if owner is None:
            owner = getattr(obj, "owner", None)
        return owner == request.user
