from django.urls import path

from .views import CategoryBreakdownView, MonthlyReportView, SummaryView, TrendView

urlpatterns = [
    path("analytics/summary/", SummaryView.as_view(), name="analytics-summary"),
    path("analytics/categories/", CategoryBreakdownView.as_view(), name="analytics-categories"),
    path("analytics/trend/", TrendView.as_view(), name="analytics-trend"),
    path("reports/monthly/", MonthlyReportView.as_view(), name="reports-monthly"),
]
