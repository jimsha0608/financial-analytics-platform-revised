import re

from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    is_default = serializers.BooleanField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "icon", "color", "is_default", "created_at")
        read_only_fields = ("id", "is_default", "created_at")

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name cannot be blank.")
        return value

    def validate_color(self, value):
        if value and not (re.fullmatch(r"#[0-9a-fA-F]{6}", value)):
            raise serializers.ValidationError("Color must be a hex code like #4C6EF5.")
        return value
