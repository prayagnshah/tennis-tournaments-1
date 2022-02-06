from unicodedata import category
import pytest

from tournaments.models import Tournaments


@pytest.mark.django_db
def test_torunaments_model():
    tournament = Tournaments(
        category="START",
        event_date="2022-02-04T09:00:00Z",
        place="Test place",
        prestige=100,
        surface="CLAY",
        capacity=16,
        price=1000,
    )
    tournament.save()
    assert tournament.category == "START"
    assert tournament.event_date == "2022-02-04T09:00:00Z"
    assert tournament.place == "Test place"
    assert tournament.prestige == 100
    assert tournament.surface == "CLAY"
    assert tournament.capacity == 16
    assert tournament.price == 1000
    assert tournament.status == "OPEN"
    assert tournament.created
    assert tournament.updated
    # assert (
    #     str(tournament)
    #     == f"Tournament of category {tournament.category} on {tournament.event_date} at {tournament.place}"
    # )
