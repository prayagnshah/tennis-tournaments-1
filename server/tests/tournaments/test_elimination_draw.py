import pytest
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.reverse import reverse
from rest_framework import status


@pytest.mark.django_db
def test_draw_create_success(client, tournament_with_8_players):
    # Given
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:elimination_draw_tournament_id")
    group_players = []
    for i in range(8):
        group_players.append(setup[f"user{i}"].id)
    # When
    response = client.post(
        path,
        data={
            "size": 8,
            "type_of": "MAIN",
            "players": group_players,
            "tournament": setup["tournament"].id,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["size"] == 8
    assert response.data["type_of"] == "MAIN"
    assert response.data["tournament"] == setup["tournament"].id
    assert set(response.data["players"]) == set(group_players)
    assert len(response.data["matches"]) == 7


@pytest.mark.django_db
@pytest.mark.parametrize("tournament_status", ["OPEN", "COMPLETED"])
def test_draw_create_invalid_tournament_status(
    client, tournament_with_8_players, tournament_status
):
    # Given
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:elimination_draw_tournament_id")
    group_players = []
    for i in range(8):
        group_players.append(setup[f"user{i}"].id)
    setup["tournament"].status = tournament_status
    setup["tournament"].save()
    # When
    response = client.post(
        path,
        data={
            "size": 8,
            "type_of": "MAIN",
            "players": group_players,
            "tournament": setup["tournament"].id,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_draw_create_invalid_path(client, tournament_with_8_players):
    # Given
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:elimination_draw_tournament_id")
    group_players = []
    for i in range(8):
        group_players.append(setup[f"user{i}"].id)
    # When
    response1 = client.post(
        f"{path}1/",
        data={
            "size": 8,
            "type_of": "MAIN",
            "players": group_players,
            "tournament": setup["tournament"].id,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    response2 = client.post(
        f"{path}?tournament_id={setup['tournament'].id}",
        data={
            "size": 8,
            "type_of": "MAIN",
            "players": group_players,
            "tournament": setup["tournament"].id,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response1.status_code == status.HTTP_400_BAD_REQUEST
    assert response2.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_create_draw_invalid_number_of_players(client, tournament_with_8_players):
    # Given
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:elimination_draw_tournament_id")
    group_players = []
    for i in range(5):
        group_players.append(setup[f"user{i}"].id)
    # When
    response = client.post(
        path,
        data={
            "size": 4,
            "type_of": "MAIN",
            "players": group_players,
            "tournament": setup["tournament"].id,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_create_draw_not_registered_user(
    client, tournament_with_8_players, create_user
):
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:elimination_draw_tournament_id")
    group_players = []
    for i in range(3):
        group_players.append(setup[f"user{i}"].id)
    group_players.append(create_user().id)
    # When
    response = client.post(
        path,
        data={
            "size": 4,
            "type_of": "MAIN",
            "players": group_players,
            "tournament": setup["tournament"].id,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_create_draw_invalid_size(client, tournament_with_8_players):
    # Given
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:elimination_draw_tournament_id")
    group_players = []
    for i in range(8):
        group_players.append(setup[f"user{i}"].id)
    # When
    response = client.post(
        path,
        data={
            "size": 64,
            "type_of": "MAIN",
            "players": group_players,
            "tournament": setup["tournament"].id,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_get_draw(client, tournament_with_8_players_2_groups_1_draw_sets_filled):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw_sets_filled
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:elimination_draw_tournament_id")
    # When
    response = client.get(f"{path}?tournament_id={setup['tournament'].id}")
    # Then
    assert response.status_code == status.HTTP_200_OK
    assert response.data["size"] == 8
    assert response.data["tournament"] == setup["tournament"].id
    assert len(response.data["players"]) == 8
    assert len(response.data["matches"]) == 7
