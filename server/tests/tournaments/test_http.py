import base64
import json
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
import pytest

PASSWORD = "pAssw0rd!"

# def create_user(username='user@example.com', password=PASSWORD):
#     return get_user_model().objects.create_user(
#         username=username,
#         first_name='Test',
#         last_name='User',
#         password=password
#     )


class AuthenticationTest(APITestCase):
    def test_user_can_sign_up(self):
        response = self.client.post(
            reverse("sign_up"),
            data={
                "username": "user@example.com",
                "email": "user@example.com",
                "first_name": "Test",
                "last_name": "User",
                "password1": PASSWORD,
                "password2": PASSWORD,
            },
        )
        user = get_user_model().objects.last()
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["id"] == user.id
        assert response.data["username"] == user.username
        assert response.data["first_name"] == user.first_name
        assert response.data["last_name"] == user.last_name


@pytest.mark.django_db
def test_user_can_log_in(client, create_user):
    user = create_user()
    response = client.post(
        reverse("log_in"),
        data={
            "username": user.username,
            "password": PASSWORD,
        },
    )

    # Parse payload data from access token.
    access = response.data["access"]
    header, payload, signature = access.split(".")
    decoded_payload = base64.b64decode(f"{payload}==")
    payload_data = json.loads(decoded_payload)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["refresh"] != None
    assert payload_data["id"] == user.id
    assert payload_data["username"] == user.username
    assert payload_data["first_name"] == user.first_name
    assert payload_data["last_name"] == user.last_name


# @pytest.mark.django_db
# def test_user_can_log_in(client, create_user):
#     user = create_user()
#     response = client.post(
#         reverse("log_in"),
#         data={
#             "username": user.username,
#             "password": PASSWORD,
#         },
#     )

#     # Parse payload data from access token.
#     access = response.data["access"]
#     header, payload, signature = access.split(".")
#     decoded_payload = base64.b64decode(f"{payload}==")
#     payload_data = json.loads(decoded_payload)

#     assert response.status_code == status.HTTP_200_OK
#     assert response.data["refresh"] != None
#     assert payload_data["id"] == user.id
#     assert payload_data["username"] == user.username
#     assert payload_data["first_name"] == user.first_name
#     assert payload_data["last_name"] == user.last_name
