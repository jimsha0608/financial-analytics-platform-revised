"""Output serializers for the analytics/reports endpoints.

These wrap plain dicts coming back from services.py. Passing money values
through DecimalField (rather than returning raw Decimal objects straight in
a Response) matters: DRF's JSON encoder falls back to float() for a bare
Decimal, silently reintroducing the floating-point issue we deliberately
avoided in the database layer. Routing everything through DecimalField
keeps every monetary value a JSON string on the wire, exactly like the
transaction serializer already does.
"""
from rest_framework import serializers

MONEY_KWARGS = {"max_digits": 14, "decimal_places": 2}


class SummarySerializer(serializers.Serializer):
    total_income = serializers.DecimalField(**MONEY_KWARGS)
    total_expenses = serializers.DecimalField(**MONEY_KWARGS)
    net_income = serializers.DecimalField(**MONEY_KWARGS)
    current_balance = serializers.DecimalField(**MONEY_KWARGS)


class CategoryBreakdownItemSerializer(serializers.Serializer):
    category_id = serializers.IntegerField(allow_null=True)
    category_name = serializers.CharField()
    color = serializers.CharField(allow_blank=True)
    total = serializers.DecimalField(**MONEY_KWARGS)
    percentage = serializers.FloatField()


class TrendPointSerializer(serializers.Serializer):
    period = serializers.DateField()
    income = serializers.DecimalField(**MONEY_KWARGS)
    expenses = serializers.DecimalField(**MONEY_KWARGS)


class LargestExpenseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    description = serializers.CharField()
    merchant = serializers.CharField(allow_blank=True)
    amount = serializers.DecimalField(**MONEY_KWARGS)
    date = serializers.DateField()
    category_name = serializers.CharField(allow_null=True)


class PreviousMonthSerializer(serializers.Serializer):
    month = serializers.CharField()
    total_income = serializers.DecimalField(**MONEY_KWARGS)
    total_expenses = serializers.DecimalField(**MONEY_KWARGS)
    net_savings = serializers.DecimalField(**MONEY_KWARGS)


class MonthlyReportSerializer(serializers.Serializer):
    month = serializers.CharField()
    total_income = serializers.DecimalField(**MONEY_KWARGS)
    total_expenses = serializers.DecimalField(**MONEY_KWARGS)
    net_savings = serializers.DecimalField(**MONEY_KWARGS)
    spending_by_category = CategoryBreakdownItemSerializer(many=True)
    largest_expenses = LargestExpenseSerializer(many=True)
    previous_month = PreviousMonthSerializer()
    income_change_percent = serializers.FloatField(allow_null=True)
    expense_change_percent = serializers.FloatField(allow_null=True)
