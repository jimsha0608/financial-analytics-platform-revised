from rest_framework.pagination import PageNumberPagination


class StandardResultsPagination(PageNumberPagination):
    """Page-number pagination with a client-adjustable page size, capped to
    prevent a caller from requesting the entire table in one response."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
