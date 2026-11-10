from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("date", "user", "type", "amount", "category", "description")
    list_filter = ("type", "category")
    search_fields = ("description", "merchant", "notes", "user__email")
    date_hierarchy = "date"
