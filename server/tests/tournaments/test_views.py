import pytest
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.reverse import reverse
from rest_framework import status

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


@pytest.mark.django_db
def test_create_tournament_success(client, create_manager_user):
    # Given
    user = create_manager_user
    access = AccessToken.for_user(user)
    path = reverse(
        "tennis:tournaments_list",
    )
    # When
    response = client.post(
        path,
        data={
            "category": "START",
            "name": "Test1",
            "event_date": "2022-02-12T06:00:00Z",
            "place": "TestPlace",
            "prestige": 100,
            "surface": "CLAY",
            "capacity": 16,
            "status": "OPEN",
            "price": 1000,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["category"] == "START"
    assert response.data["name"] == "Test1"
    assert response.data["event_date"] == "2022-02-12T06:00:00Z"
    assert response.data["place"] == "TestPlace"
    assert response.data["prestige"] == 100
    assert response.data["surface"] == "CLAY"
    assert response.data["capacity"] == 16
    assert response.data["status"] == "OPEN"
    assert response.data["price"] == 1000


@pytest.mark.django_db
def test_create_torunament_fail_not_manager(client, create_user):
    # Given
    user = create_user()
    access = AccessToken.for_user(user)
    path = reverse(
        "tennis:tournaments_list",
    )
    print(user.group)
    # When
    response = client.post(
        path,
        data={
            "category": "START",
            "name": "Test1",
            "event_date": "2022-02-12T06:00:00Z",
            "place": "TestPlace",
            "prestige": 100,
            "surface": "CLAY",
            "capacity": 16,
            "status": "OPEN",
            "price": 1000,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.actualtest
@pytest.mark.django_db
def test_create_torunament_fail_no_user(client):
    # Given
    path = reverse(
        "tennis:tournaments_list",
    )
    # When
    response = client.post(
        path,
        data={
            "category": "START",
            "name": "Test1",
            "event_date": "2022-02-12T06:00:00Z",
            "place": "TestPlace",
            "prestige": 100,
            "surface": "CLAY",
            "capacity": 16,
            "status": "OPEN",
            "price": 1000,
        },
    )
    # Then
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_can_update_tournament_status(client, create_manager_user, add_tournament):
    # Given
    user = create_manager_user
    tournament = add_tournament()
    access = AccessToken.for_user(user)
    path = reverse("tennis:tournament_detail", kwargs={"pk": tournament.id})
    # When
    response = client.put(
        path,
        data={
            "status": "CONSOLIDATED",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
        content_type="application/json",
    )
    # Then
    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == tournament.id
    assert response.data["status"] == "CONSOLIDATED"


@pytest.mark.django_db
def test_cant_update_torunament_status(client, create_user, add_tournament):
    # Given
    user = create_user()
    tournament = add_tournament()
    access = AccessToken.for_user(user)
    path = reverse("tennis:tournament_detail", kwargs={"pk": tournament.id})
    # When
    response = client.put(
        path,
        data={
            "status": "CONSOLIDATED",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
        content_type="application/json",
    )
    # Then
    assert response.status_code == status.HTTP_404_NOT_FOUND
