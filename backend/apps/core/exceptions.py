import logging

from django.db import IntegrityError
from rest_framework import exceptions as drf_exceptions
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    if isinstance(exc, IntegrityError):
        exc = drf_exceptions.ValidationError(
            {"detail": "This operation violates a database constraint."}
        )

    response = drf_exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled exception in %s", context.get("view"))
        return Response(
            {"detail": "An unexpected error occurred. Please try again later."},
            status=500,
        )

    data = response.data
    if isinstance(data, dict) and list(data.keys()) == ["detail"]:
        return response

    if isinstance(data, list):
        response.data = {"detail": "Invalid request.", "errors": {"non_field_errors": data}}
    elif isinstance(data, dict):
        detail = data.pop("detail", None)
        if detail is None:
            detail = "Validation failed."
        response.data = {"detail": detail, "errors": data} if data else {"detail": detail}

    return response
