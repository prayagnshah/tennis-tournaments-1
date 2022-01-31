import pytest

from tournaments.models import Tournamnets


@pytest.fixture(scope="function")
def add_tournament():
    def _add_tournament(
        category="START",
        event_date="2022-02-04T09:00:00Z",
        place="Test place",
        prestige=100,
        surface="CLAY",
        capacity=16,
        price=1000,
    ):
        tournament = Tournamnets.objects.create(
            category=category,
            event_date=event_date,
            place=place,
            prestige=prestige,
            surface=surface,
            capacity=capacity,
            price=price,
        )
        return tournament

    return _add_tournament
