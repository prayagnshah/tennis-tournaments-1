import pytest

# from tournaments.models import Tournaments


@pytest.mark.django_db
def test_get_single_tournament(client, add_tournament):
    tournament = add_tournament()
    resp = client.get(f"/tennis/tournament/{tournament.id}/")
    assert resp.status_code == 200
    assert resp.data["category"] == tournament.category
    assert resp.data["place"] == tournament.place


def test_get_single_tournament_incorrect_id(client):
    resp = client.get("/tennis/torunament/foo/")
    assert resp.status_code == 404


@pytest.mark.django_db
def test_get_all_torunaments(client, add_tournament):
    tournament_one = add_tournament()
    tournament_two = add_tournament(
        category="SPORT",
        event_date="2022-02-05T09:00:00Z",
        place="Test place 2",
        prestige=100,
        surface="CLAY",
        capacity=16,
        price=1000,
    )
    resp = client.get("/tennis/tournaments/")
    assert resp.status_code == 200
    assert resp.data[0]["place"] == tournament_one.place
    assert resp.data[1]["place"] == tournament_two.place
