from django.db.models import Q
from rest_framework import permissions, viewsets

from apps.core.permissions import IsOwner

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = []

    def get_queryset(self):
        user = self.request.user
        return Category.objects.filter(Q(owner__isnull=True) | Q(owner=user))

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
