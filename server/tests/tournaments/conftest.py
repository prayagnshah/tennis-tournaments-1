import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from tournaments.models import Tournaments, Registration

PASSWORD = "pAssw0rd!"


@pytest.fixture
def api_client():
    return APIClient


@pytest.fixture(scope="function")
def add_tournament():
    def _add_tournament(
        category="START",
        event_date="2022-02-04T09:00:00Z",
        place="Test place",
        prestige=100,
        surface="CLAY",
        status="OPEN",
        capacity=16,
        price=1000,
    ):
        tournament = Tournaments.objects.create(
            category=category,
            event_date=event_date,
            place=place,
            prestige=prestige,
            surface=surface,
            status=status,
            capacity=capacity,
            price=price,
        )
        return tournament

    return _add_tournament


@pytest.fixture(scope="function")
def create_user():
    def _create_user(
        # username="user@example.com",
        email="user@example.com",
        password=PASSWORD,
        first_name="Test",
        last_name="User",
    ):
        user = get_user_model().objects.create_user(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
        )
        return user

    return _create_user


@pytest.fixture(scope="function")
def create_registration():
    def _create_registration(user, tournament, status="REGISTERED"):
        registration = Registration.objects.create(
            user=user, tournament=tournament, status=status
        )
        return registration

    return _create_registration
