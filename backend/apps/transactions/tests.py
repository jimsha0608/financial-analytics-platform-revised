import datetime

import pytest
from rest_framework import status

from .models import Transaction

TRANSACTIONS_URL = "/api/transactions/"


def _detail_url(pk):
    return f"{TRANSACTIONS_URL}{pk}/"


@pytest.mark.django_db
class TestTransactionCreate:
    def test_create_expense(self, auth_client, user, food_category):
        response = auth_client.post(
            TRANSACTIONS_URL,
            {
                "type": "expense",
                "amount": "42.50",
                "date": "2026-08-10",
                "description": "Groceries",
                "merchant": "Countdown",
                "category": food_category.id,
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        txn = Transaction.objects.get(id=response.data["id"])
        assert txn.user == user
        assert str(txn.amount) == "42.50"

    def test_create_income_without_category(self, auth_client):
        response = auth_client.post(
            TRANSACTIONS_URL,
            {"type": "income", "amount": "2000.00", "date": "2026-08-01", "description": "Salary"},
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_negative_amount_rejected(self, auth_client):
        response = auth_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "-5.00", "date": "2026-08-10", "description": "bad"},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_zero_amount_rejected(self, auth_client):
        response = auth_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "0.00", "date": "2026-08-10", "description": "bad"},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_future_date_rejected(self, auth_client):
        future = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()
        response = auth_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "10.00", "date": future, "description": "future"},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_missing_required_field_rejected(self, auth_client):
        response = auth_client.post(TRANSACTIONS_URL, {"type": "expense", "amount": "10.00"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "date" in response.data["errors"]

    def test_cannot_use_another_users_custom_category(self, auth_client, other_user):
        from apps.categories.models import Category

        their_category = Category.objects.create(name="Private", owner=other_user)
        response = auth_client.post(
            TRANSACTIONS_URL,
            {
                "type": "expense",
                "amount": "10.00",
                "date": "2026-08-10",
                "description": "x",
                "category": their_category.id,
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unauthenticated_request_rejected(self, api_client):
        response = api_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "10.00", "date": "2026-08-10", "description": "x"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTransactionIsolation:
    def test_list_only_returns_own_transactions(self, auth_client, other_auth_client):
        auth_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "10.00", "date": "2026-08-10", "description": "mine"},
        )
        response = other_auth_client.get(TRANSACTIONS_URL)
        assert response.data["count"] == 0

    def test_cannot_retrieve_other_users_transaction(self, auth_client, other_auth_client):
        created = auth_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "10.00", "date": "2026-08-10", "description": "mine"},
        )
        response = other_auth_client.get(_detail_url(created.data["id"]))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_cannot_update_other_users_transaction(self, auth_client, other_auth_client):
        created = auth_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "10.00", "date": "2026-08-10", "description": "mine"},
        )
        response = other_auth_client.patch(_detail_url(created.data["id"]), {"amount": "999.00"})
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_cannot_delete_other_users_transaction(self, auth_client, other_auth_client):
        created = auth_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "10.00", "date": "2026-08-10", "description": "mine"},
        )
        response = other_auth_client.delete(_detail_url(created.data["id"]))
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert Transaction.objects.filter(id=created.data["id"]).exists()


@pytest.mark.django_db
class TestTransactionUpdateDelete:
    def test_owner_can_update(self, auth_client):
        created = auth_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "10.00", "date": "2026-08-10", "description": "mine"},
        )
        response = auth_client.patch(_detail_url(created.data["id"]), {"amount": "15.00"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["amount"] == "15.00"

    def test_owner_can_delete(self, auth_client):
        created = auth_client.post(
            TRANSACTIONS_URL,
            {"type": "expense", "amount": "10.00", "date": "2026-08-10", "description": "mine"},
        )
        response = auth_client.delete(_detail_url(created.data["id"]))
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Transaction.objects.filter(id=created.data["id"]).exists()


@pytest.mark.django_db
class TestTransactionFilteringSearchSort:
    @pytest.fixture(autouse=True)
    def _seed(self, auth_client, food_category, transport_category):
        auth_client.post(
            TRANSACTIONS_URL,
            {
                "type": "expense",
                "amount": "50.00",
                "date": "2026-08-01",
                "description": "Groceries run",
                "category": food_category.id,
            },
        )
        auth_client.post(
            TRANSACTIONS_URL,
            {
                "type": "expense",
                "amount": "20.00",
                "date": "2026-08-15",
                "description": "Bus ticket",
                "category": transport_category.id,
            },
        )
        auth_client.post(
            TRANSACTIONS_URL,
            {"type": "income", "amount": "2000.00", "date": "2026-08-01", "description": "Salary"},
        )

    def test_filter_by_type(self, auth_client):
        response = auth_client.get(TRANSACTIONS_URL, {"type": "income"})
        assert response.data["count"] == 1
        assert response.data["results"][0]["description"] == "Salary"

    def test_filter_by_category(self, auth_client, food_category):
        response = auth_client.get(TRANSACTIONS_URL, {"category": food_category.id})
        assert response.data["count"] == 1

    def test_filter_by_date_range(self, auth_client):
        response = auth_client.get(
            TRANSACTIONS_URL, {"date_from": "2026-08-10", "date_to": "2026-08-31"}
        )
        assert response.data["count"] == 1
        assert response.data["results"][0]["description"] == "Bus ticket"

    def test_filter_by_amount_range(self, auth_client):
        response = auth_client.get(TRANSACTIONS_URL, {"min_amount": "30", "max_amount": "100"})
        assert response.data["count"] == 1
        assert response.data["results"][0]["description"] == "Groceries run"

    def test_search_by_description(self, auth_client):
        response = auth_client.get(TRANSACTIONS_URL, {"search": "bus"})
        assert response.data["count"] == 1
        assert response.data["results"][0]["description"] == "Bus ticket"

    def test_ordering_by_amount_ascending(self, auth_client):
        response = auth_client.get(TRANSACTIONS_URL, {"ordering": "amount"})
        amounts = [r["amount"] for r in response.data["results"]]
        assert amounts == ["20.00", "50.00", "2000.00"]
