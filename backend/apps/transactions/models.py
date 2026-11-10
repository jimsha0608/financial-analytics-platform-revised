import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Transaction(models.Model):
    """A single income or expense record belonging to one user.

    Uses a UUID primary key rather than an auto-incrementing integer: these
    IDs are exposed directly in URLs (/api/transactions/{id}/), and a
    sequential ID would let one authenticated user infer how many
    transactions exist system-wide, or enumerate other users' records by
    walking the ID space even though `IsOwner` would reject each guess.
    """

    class TransactionType(models.TextChoices):
        INCOME = "income", "Income"
        EXPENSE = "expense", "Expense"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions"
    )
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
    )
    type = models.CharField(max_length=7, choices=TransactionType.choices)
    # Decimal, never float: money must never be subject to binary
    # floating-point rounding error (0.1 + 0.2 != 0.3).
    amount = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    date = models.DateField()
    description = models.CharField(max_length=255)
    merchant = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["user", "date"]),
            models.Index(fields=["user", "type"]),
            models.Index(fields=["user", "category"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=0), name="transaction_amount_positive"
            ),
        ]

    def __str__(self):
        return f"{self.get_type_display()} {self.amount} - {self.description}"
