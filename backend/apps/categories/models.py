from django.conf import settings
from django.db import models
from django.db.models import Q


class Category(models.Model):
    """A transaction category.

    owner=None means a global default category, visible to and shared by
    every user (Food, Rent, etc.). A non-null owner is a category a specific
    user created for themselves. This lets the category list grow per-user
    without ever duplicating the default set.
    """

    name = models.CharField(max_length=50)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, blank=True, help_text="Hex color, e.g. #4C6EF5")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"
        constraints = [
            # A user can't have two custom categories with the same name.
            models.UniqueConstraint(fields=["owner", "name"], name="unique_category_per_owner"),
            models.UniqueConstraint(
                fields=["name"],
                condition=Q(owner__isnull=True),
                name="unique_global_category_name",
            ),
        ]

    def __str__(self):
        return self.name

    @property
    def is_default(self):
        return self.owner_id is None
