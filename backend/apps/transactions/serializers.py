from django.utils import timezone
from rest_framework import serializers

from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Transaction
        fields = (
            "id",
            "type",
            "amount",
            "date",
            "description",
            "merchant",
            "notes",
            "category",
            "category_name",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Date cannot be in the future.")
        return value

    def validate_category(self, value):
        if value is None:
            return value
        request = self.context["request"]
        if value.owner_id is not None and value.owner_id != request.user.id:
            raise serializers.ValidationError("You do not have access to this category.")
        return value
