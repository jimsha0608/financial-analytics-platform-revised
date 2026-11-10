from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/", include("apps.categories.urls")),
    path("api/", include("apps.transactions.urls")),
    path("api/", include("apps.analytics.urls")),
]
