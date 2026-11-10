from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .query_serializers import (
    CategoryBreakdownQuerySerializer,
    DateRangeQuerySerializer,
    MonthlyReportQuerySerializer,
    TrendQuerySerializer,
)
from .serializers import (
    CategoryBreakdownItemSerializer,
    MonthlyReportSerializer,
    SummarySerializer,
    TrendPointSerializer,
)


class SummaryView(APIView):
    """GET /api/analytics/summary/?date_from=&date_to="""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = DateRangeQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        data = services.get_summary(request.user, **query.validated_data)
        return Response(SummarySerializer(data).data)


class CategoryBreakdownView(APIView):
    """GET /api/analytics/categories/?date_from=&date_to=&type=expense"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = CategoryBreakdownQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        v = query.validated_data
        data = services.get_category_breakdown(
            request.user,
            date_from=v.get("date_from"),
            date_to=v.get("date_to"),
            txn_type=v.get("type", "expense"),
        )
        return Response(CategoryBreakdownItemSerializer(data, many=True).data)


class TrendView(APIView):
    """GET /api/analytics/trend/?date_from=&date_to=&interval=day|week|month"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = TrendQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        v = query.validated_data
        data = services.get_trend(
            request.user,
            date_from=v.get("date_from"),
            date_to=v.get("date_to"),
            interval=v.get("interval", "month"),
        )
        return Response(TrendPointSerializer(data, many=True).data)


class MonthlyReportView(APIView):
    """GET /api/reports/monthly/?month=YYYY-MM"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = MonthlyReportQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        data = services.get_monthly_report(request.user, query.validated_data["month"])
        return Response(MonthlyReportSerializer(data).data)
