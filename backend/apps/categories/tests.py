import pytest
from rest_framework import status

from .models import Category

CATEGORIES_URL = "/api/categories/"


@pytest.mark.django_db
class TestCategoryList:
    def test_default_categories_are_seeded_by_migration(self):
        assert Category.objects.filter(owner=None).count() == 10

    def test_list_includes_defaults_and_own_categories(self, auth_client, user):
        Category.objects.create(name="Side Hustle", owner=user)
        response = auth_client.get(CATEGORIES_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 11

    def test_list_excludes_other_users_custom_categories(self, auth_client, other_user):
        Category.objects.create(name="Other's Category", owner=other_user)
        response = auth_client.get(CATEGORIES_URL)
        names = [c["name"] for c in response.data["results"]]
        assert "Other's Category" not in names


@pytest.mark.django_db
class TestCategoryCreate:
    def test_create_sets_owner_to_requesting_user(self, auth_client, user):
        response = auth_client.post(CATEGORIES_URL, {"name": "Freelance"})
        assert response.status_code == status.HTTP_201_CREATED
        category = Category.objects.get(id=response.data["id"])
        assert category.owner == user
        assert category.is_default is False

    def test_duplicate_name_for_same_user_rejected(self, auth_client):
        auth_client.post(CATEGORIES_URL, {"name": "Freelance"})
        response = auth_client.post(CATEGORIES_URL, {"name": "Freelance"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_same_name_allowed_for_different_users(self, auth_client, other_auth_client):
        r1 = auth_client.post(CATEGORIES_URL, {"name": "Freelance"})
        r2 = other_auth_client.post(CATEGORIES_URL, {"name": "Freelance"})
        assert r1.status_code == status.HTTP_201_CREATED
        assert r2.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
class TestCategoryMutation:
    def test_cannot_edit_default_category(self, auth_client, food_category):
        response = auth_client.patch(f"{CATEGORIES_URL}{food_category.id}/", {"name": "Hacked"})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cannot_delete_default_category(self, auth_client, food_category):
        response = auth_client.delete(f"{CATEGORIES_URL}{food_category.id}/")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Category.objects.filter(id=food_category.id).exists()

    def test_owner_can_edit_own_category(self, auth_client, user):
        category = Category.objects.create(name="Freelance", owner=user)
        response = auth_client.patch(f"{CATEGORIES_URL}{category.id}/", {"name": "Consulting"})
        assert response.status_code == status.HTTP_200_OK
        category.refresh_from_db()
        assert category.name == "Consulting"

    def test_cannot_edit_other_users_category(self, auth_client, other_user):
        category = Category.objects.create(name="Their Category", owner=other_user)
        response = auth_client.patch(f"{CATEGORIES_URL}{category.id}/", {"name": "Hacked"})
        assert response.status_code == status.HTTP_404_NOT_FOUND
