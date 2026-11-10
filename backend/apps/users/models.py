from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    """Custom user model, authenticated by email instead of a username.

    Starting with a custom user model (even one that just tweaks the login
    field) is standard Django practice: swapping AUTH_USER_MODEL after
    other tables have FKs into auth.User is a very painful migration, so we
    pay the small upfront cost now instead.
    """

    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
