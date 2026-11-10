from calendar import monthrange
from datetime import date
from decimal import Decimal

from django.db.models import Q, Sum
from django.db.models.functions import TruncDay, TruncMonth, TruncWeek

from apps.transactions.models import Transaction

ZERO = Decimal("0.00")

TRUNC_FUNCS = {"day": TruncDay, "week": TruncWeek, "month": TruncMonth}


def _scoped_qs(user, date_from=None, date_to=None):
    qs = Transaction.objects.filter(user=user)
    if date_from:
        qs = qs.filter(date__gte=date_from)
    if date_to:
        qs = qs.filter(date__lte=date_to)
    return qs


def _income_expense_totals(qs):
    totals = qs.aggregate(
        income=Sum("amount", filter=Q(type=Transaction.TransactionType.INCOME)),
        expenses=Sum("amount", filter=Q(type=Transaction.TransactionType.EXPENSE)),
    )
    return totals["income"] or ZERO, totals["expenses"] or ZERO


def get_summary(user, date_from=None, date_to=None):
    """Return totals for the selected dates and the all-time balance."""
    income, expenses = _income_expense_totals(_scoped_qs(user, date_from, date_to))

    all_time_income, all_time_expenses = _income_expense_totals(_scoped_qs(user))
    balance = all_time_income - all_time_expenses

    return {
        "total_income": income,
        "total_expenses": expenses,
        "net_income": income - expenses,
        "current_balance": balance,
    }


def get_category_breakdown(user, date_from=None, date_to=None, txn_type=Transaction.TransactionType.EXPENSE):
    qs = _scoped_qs(user, date_from, date_to).filter(type=txn_type)
    rows = (
        qs.values("category_id", "category__name", "category__color")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )
    rows = list(rows)
    grand_total = sum((row["total"] or ZERO for row in rows), ZERO)

    result = []
    for row in rows:
        total = row["total"] or ZERO
        percentage = float(total / grand_total * 100) if grand_total else 0.0
        result.append(
            {
                "category_id": row["category_id"],
                "category_name": row["category__name"] or "Uncategorized",
                "color": row["category__color"] or "",
                "total": total,
                "percentage": round(percentage, 2),
            }
        )
    return result


def get_trend(user, date_from=None, date_to=None, interval="month"):
    trunc = TRUNC_FUNCS.get(interval, TruncMonth)
    qs = _scoped_qs(user, date_from, date_to)
    rows = (
        qs.annotate(period=trunc("date"))
        .values("period")
        .annotate(
            income=Sum("amount", filter=Q(type=Transaction.TransactionType.INCOME)),
            expenses=Sum("amount", filter=Q(type=Transaction.TransactionType.EXPENSE)),
        )
        .order_by("period")
    )
    return [
        {
            "period": row["period"],
            "income": row["income"] or ZERO,
            "expenses": row["expenses"] or ZERO,
        }
        for row in rows
    ]


def _percent_change(old, new):
    if old == 0:
        return None  # undefined (division by zero) - frontend renders "N/A"
    return round(float((new - old) / old * 100), 2)


def get_monthly_report(user, month: date):
    start = month.replace(day=1)
    end = month.replace(day=monthrange(month.year, month.month)[1])

    if start.month == 1:
        prev_start = start.replace(year=start.year - 1, month=12)
    else:
        prev_start = start.replace(month=start.month - 1)
    prev_end = prev_start.replace(day=monthrange(prev_start.year, prev_start.month)[1])

    current = get_summary(user, start, end)
    previous = get_summary(user, prev_start, prev_end)

    largest_expenses = [
        {
            "id": t.id,
            "description": t.description,
            "merchant": t.merchant,
            "amount": t.amount,
            "date": t.date,
            "category_name": t.category.name if t.category else None,
        }
        for t in (
            _scoped_qs(user, start, end)
            .filter(type=Transaction.TransactionType.EXPENSE)
            .select_related("category")
            .order_by("-amount")[:5]
        )
    ]

    return {
        "month": start.isoformat(),
        "total_income": current["total_income"],
        "total_expenses": current["total_expenses"],
        "net_savings": current["net_income"],
        "spending_by_category": get_category_breakdown(user, start, end),
        "largest_expenses": largest_expenses,
        "previous_month": {
            "month": prev_start.isoformat(),
            "total_income": previous["total_income"],
            "total_expenses": previous["total_expenses"],
            "net_savings": previous["net_income"],
        },
        "income_change_percent": _percent_change(previous["total_income"], current["total_income"]),
        "expense_change_percent": _percent_change(previous["total_expenses"], current["total_expenses"]),
    }
