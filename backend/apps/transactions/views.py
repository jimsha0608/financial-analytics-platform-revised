from rest_framework import permissions, viewsets

from apps.core.permissions import IsOwner

from .filters import TransactionFilter
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    """Full CRUD over the authenticated user's own transactions, with
    backend-side search/filter/sort/pagination so the frontend never has to
    download the full table to slice it client-side."""

    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filterset_class = TransactionFilter
    search_fields = ["description", "merchant", "notes"]
    ordering_fields = ["date", "amount", "created_at"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related("category")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
