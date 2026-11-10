import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()

REGISTER_URL = "/api/auth/register/"
LOGIN_URL = "/api/auth/login/"
REFRESH_URL = "/api/auth/refresh/"
LOGOUT_URL = "/api/auth/logout/"
ME_URL = "/api/auth/me/"


@pytest.mark.django_db
class TestRegistration:
    def test_register_creates_user_with_hashed_password(self, api_client):
        response = api_client.post(
            REGISTER_URL,
            {
                "email": "new@example.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "first_name": "New",
                "last_name": "User",
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        user = User.objects.get(email="new@example.com")
        assert user.password != "SecurePass123!"
        assert user.check_password("SecurePass123!")

    def test_register_duplicate_email_rejected(self, api_client, user):
        response = api_client.post(
            REGISTER_URL,
            {
                "email": user.email,
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch_rejected(self, api_client):
        response = api_client.post(
            REGISTER_URL,
            {
                "email": "mismatch@example.com",
                "password": "SecurePass123!",
                "password_confirm": "DifferentPass123!",
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password_confirm" in response.data["errors"]

    def test_register_weak_password_rejected(self, api_client):
        response = api_client.post(
            REGISTER_URL,
            {"email": "weak@example.com", "password": "12345678", "password_confirm": "12345678"},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    def test_login_success_returns_tokens_and_profile(self, api_client, user):
        response = api_client.post(LOGIN_URL, {"email": user.email, "password": "SecurePass123!"})
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data["user"]["email"] == user.email

    def test_login_wrong_password_rejected(self, api_client, user):
        response = api_client.post(LOGIN_URL, {"email": user.email, "password": "wrong-password"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user_rejected(self, api_client):
        response = api_client.post(
            LOGIN_URL, {"email": "ghost@example.com", "password": "whatever123"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefreshAndLogout:
    def test_refresh_returns_new_access_token(self, api_client, user):
        login = api_client.post(LOGIN_URL, {"email": user.email, "password": "SecurePass123!"})
        response = api_client.post(REFRESH_URL, {"refresh": login.data["refresh"]})
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data

    def test_logout_blacklists_refresh_token(self, api_client, user):
        login = api_client.post(LOGIN_URL, {"email": user.email, "password": "SecurePass123!"})
        refresh = login.data["refresh"]
        api_client.force_authenticate(user=user)

        logout_response = api_client.post(LOGOUT_URL, {"refresh": refresh})
        assert logout_response.status_code == status.HTTP_204_NO_CONTENT

        api_client.force_authenticate(user=None)
        reuse_response = api_client.post(REFRESH_URL, {"refresh": refresh})
        assert reuse_response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProfile:
    def test_me_requires_authentication(self, api_client):
        response = api_client.get(ME_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_returns_own_profile(self, auth_client, user):
        response = auth_client.get(ME_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == user.email

    def test_me_can_update_name(self, auth_client):
        response = auth_client.patch(ME_URL, {"first_name": "Updated"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["first_name"] == "Updated"

    def test_me_cannot_change_email(self, auth_client, user):
        response = auth_client.patch(ME_URL, {"email": "hijacked@example.com"})
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.email != "hijacked@example.com"
