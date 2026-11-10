import pytest
from rest_framework.test import APIClient

from apps.categories.models import Category


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(django_user_model):
    def _create(email="user@example.com", password="SecurePass123!", **kwargs):
        return django_user_model.objects.create_user(email=email, password=password, **kwargs)

    return _create


@pytest.fixture
def user(create_user):
    return create_user(email="user@example.com")


@pytest.fixture
def other_user(create_user):
    return create_user(email="other@example.com")


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def other_auth_client(other_user):
    client = APIClient()
    client.force_authenticate(user=other_user)
    return client


@pytest.fixture
def food_category():
    return Category.objects.get(owner=None, name="Food")


@pytest.fixture
def transport_category():
    return Category.objects.get(owner=None, name="Transport")
