from django.db import migrations

DEFAULT_CATEGORIES = [
    ("Food", "utensils", "#F97316"),
    ("Transport", "car", "#3B82F6"),
    ("Rent", "home", "#8B5CF6"),
    ("Utilities", "bolt", "#EAB308"),
    ("Entertainment", "film", "#EC4899"),
    ("Shopping", "shopping-bag", "#14B8A6"),
    ("Healthcare", "heart-pulse", "#EF4444"),
    ("Education", "book", "#06B6D4"),
    ("Subscriptions", "repeat", "#6366F1"),
    ("Other", "ellipsis", "#6B7280"),
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model("categories", "Category")
    for name, icon, color in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            name=name, owner=None, defaults={"icon": icon, "color": color}
        )


def remove_default_categories(apps, schema_editor):
    Category = apps.get_model("categories", "Category")
    Category.objects.filter(
        owner=None, name__in=[name for name, _, _ in DEFAULT_CATEGORIES]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("categories", "0002_initial"),
    ]

    operations = [
        migrations.RunPython(seed_categories, remove_default_categories),
    ]
