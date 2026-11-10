from django.contrib import admin

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "is_default", "created_at")
    list_filter = ("owner",)
    search_fields = ("name",)
