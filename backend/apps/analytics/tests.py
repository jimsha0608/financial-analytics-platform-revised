import pytest
from rest_framework import status

SUMMARY_URL = "/api/analytics/summary/"
CATEGORIES_URL = "/api/analytics/categories/"
TREND_URL = "/api/analytics/trend/"
MONTHLY_REPORT_URL = "/api/reports/monthly/"
TRANSACTIONS_URL = "/api/transactions/"


def _create_transaction(client, **overrides):
    payload = {
        "type": "expense",
        "amount": "10.00",
        "date": "2026-08-01",
        "description": "txn",
    }
    payload.update(overrides)
    response = client.post(TRANSACTIONS_URL, payload)
    assert response.status_code == status.HTTP_201_CREATED, response.data
    return response.data


@pytest.mark.django_db
class TestSummary:
    def test_computes_income_expenses_net_and_balance(self, auth_client):
        _create_transaction(auth_client, type="income", amount="2000.00", date="2026-08-01")
        _create_transaction(auth_client, type="expense", amount="600.00", date="2026-08-05")

        response = auth_client.get(SUMMARY_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["total_income"] == "2000.00"
        assert response.data["total_expenses"] == "600.00"
        assert response.data["net_income"] == "1400.00"
        assert response.data["current_balance"] == "1400.00"

    def test_totals_respect_date_range_but_balance_stays_all_time(self, auth_client):
        _create_transaction(auth_client, type="income", amount="1000.00", date="2026-06-01")
        _create_transaction(auth_client, type="expense", amount="100.00", date="2026-08-05")

        response = auth_client.get(SUMMARY_URL, {"date_from": "2026-08-01", "date_to": "2026-08-31"})
        assert response.data["total_income"] == "0.00"
        assert response.data["total_expenses"] == "100.00"
        # balance reflects everything ever recorded, not just the August window
        assert response.data["current_balance"] == "900.00"

    def test_invalid_date_range_rejected(self, auth_client):
        response = auth_client.get(SUMMARY_URL, {"date_from": "2026-08-31", "date_to": "2026-08-01"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_scoped_to_requesting_user_only(self, auth_client, other_auth_client):
        _create_transaction(auth_client, type="income", amount="500.00")
        response = other_auth_client.get(SUMMARY_URL)
        assert response.data["total_income"] == "0.00"

    def test_unauthenticated_rejected(self, api_client):
        response = api_client.get(SUMMARY_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestCategoryBreakdown:
    def test_percentages_sum_to_one_hundred(self, auth_client, food_category, transport_category):
        _create_transaction(auth_client, amount="75.00", category=food_category.id)
        _create_transaction(auth_client, amount="25.00", category=transport_category.id)

        response = auth_client.get(CATEGORIES_URL)
        by_name = {row["category_name"]: row for row in response.data}
        assert by_name["Food"]["percentage"] == 75.0
        assert by_name["Transport"]["percentage"] == 25.0

    def test_income_vs_expense_type_filter(self, auth_client):
        _create_transaction(auth_client, type="income", amount="500.00")
        _create_transaction(auth_client, type="expense", amount="50.00")

        expense_response = auth_client.get(CATEGORIES_URL, {"type": "expense"})
        income_response = auth_client.get(CATEGORIES_URL, {"type": "income"})
        assert sum(float(r["total"]) for r in expense_response.data) == 50.0
        assert sum(float(r["total"]) for r in income_response.data) == 500.0


@pytest.mark.django_db
class TestTrend:
    def test_groups_by_month(self, auth_client):
        _create_transaction(auth_client, type="income", amount="1000.00", date="2026-07-15")
        _create_transaction(auth_client, type="income", amount="1000.00", date="2026-08-15")

        response = auth_client.get(TREND_URL, {"interval": "month"})
        assert len(response.data) == 2
        periods = [row["period"] for row in response.data]
        assert periods == ["2026-07-01", "2026-08-01"]


@pytest.mark.django_db
class TestMonthlyReport:
    def test_requires_month_param(self, auth_client):
        response = auth_client.get(MONTHLY_REPORT_URL)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_compares_against_previous_month(self, auth_client):
        _create_transaction(auth_client, type="income", amount="1000.00", date="2026-07-01")
        _create_transaction(auth_client, type="expense", amount="200.00", date="2026-07-05")

        _create_transaction(auth_client, type="income", amount="1500.00", date="2026-08-01")
        _create_transaction(auth_client, type="expense", amount="300.00", date="2026-08-05")

        response = auth_client.get(MONTHLY_REPORT_URL, {"month": "2026-08"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["total_income"] == "1500.00"
        assert response.data["total_expenses"] == "300.00"
        assert response.data["net_savings"] == "1200.00"
        assert response.data["previous_month"]["total_income"] == "1000.00"
        assert response.data["income_change_percent"] == 50.0
        assert response.data["expense_change_percent"] == 50.0

    def test_percent_change_is_null_when_previous_month_has_no_data(self, auth_client):
        _create_transaction(auth_client, type="income", amount="1500.00", date="2026-08-01")
        response = auth_client.get(MONTHLY_REPORT_URL, {"month": "2026-08"})
        assert response.data["income_change_percent"] is None

    def test_largest_expenses_ordered_descending(self, auth_client):
        _create_transaction(auth_client, amount="10.00", date="2026-08-01", description="small")
        _create_transaction(auth_client, amount="500.00", date="2026-08-02", description="big")

        response = auth_client.get(MONTHLY_REPORT_URL, {"month": "2026-08"})
        descriptions = [e["description"] for e in response.data["largest_expenses"]]
        assert descriptions[0] == "big"
