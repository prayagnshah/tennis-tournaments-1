import pytest
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.reverse import reverse
from rest_framework import status


@pytest.mark.django_db
@pytest.mark.parametrize("players_count", [3, 4, 5])
def test_groups_create_success(client, tournament_with_8_players, players_count):
    # Given
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse(
        "tennis:groups_for_torunament", kwargs={"pk": setup["tournament"].id}
    )
    group_players = []
    for i in range(players_count):
        group_players.append(setup[f"user{i}"].id)
    # When
    response = client.post(
        path,
        data={
            "name": "Test Group 1",
            "tournament": setup["tournament"].id,
            "players": group_players,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    # assert response.data == ""
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["name"] == "Test Group 1"
    assert response.data["tournament"] == setup["tournament"].id
    assert set(response.data["players"]) == set(group_players)
    assert setup["user1"].email == "test1@example.com"
    assert setup["user0"].email == "test0@example.com"


@pytest.mark.django_db
@pytest.mark.parametrize("players_count", [2, 6])
def test_groups_create_invalid_number_of_players_2(
    client, tournament_with_8_players, players_count
):
    # Given
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse(
        "tennis:groups_for_torunament", kwargs={"pk": setup["tournament"].id}
    )
    group_players = []
    for i in range(players_count):
        group_players.append(setup[f"user{i}"].id)
    # When
    response = client.post(
        path,
        data={
            "name": "Test Group 1",
            "tournament": setup["tournament"].id,
            "players": group_players,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
@pytest.mark.parametrize("tournament_status", ["OPEN", "COMPLETED"])
def test_groups_create_invalid_tournament_status(
    client, tournament_with_8_players, tournament_status
):
    # Given
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse(
        "tennis:groups_for_torunament", kwargs={"pk": setup["tournament"].id}
    )
    group_players = []
    for i in range(4):
        group_players.append(setup[f"user{i}"].id)
    setup["tournament"].status = tournament_status
    setup["tournament"].save()
    # When
    response = client.post(
        path,
        data={
            "name": "Test Group 1",
            "tournament": setup["tournament"].id,
            "players": group_players,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_group_create_player_not_registered(
    client, tournament_with_8_players, create_user
):
    # Given
    setup = tournament_with_8_players
    access = AccessToken.for_user(setup["user0"])
    path = reverse(
        "tennis:groups_for_torunament", kwargs={"pk": setup["tournament"].id}
    )
    group_players = []
    for i in range(3):
        group_players.append(setup[f"user{i}"].id)
    group_players.append(create_user().id)
    # When
    response = client.post(
        path,
        data={
            "name": "Test Group 1",
            "tournament": setup["tournament"].id,
            "players": group_players,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.actualtest
@pytest.mark.django_db
def test_get_group(client, tournament_with_8_players_2_groups_1_draw_sets_filled):
    #  Given
    setup = tournament_with_8_players_2_groups_1_draw_sets_filled
    access = AccessToken.for_user(setup["user0"])
    path = reverse(
        "tennis:groups_for_torunament", kwargs={"pk": setup["tournament"].id}
    )
    # When
    response = client.get(path)
    # Then
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2
    assert "name" in response.data[0]
    assert len(response.data[0]["players"]) == 4
    assert response.data[0]["tournament"] == setup["tournament"].id
    assert len(response.data[0]["set_stats"]) == 6
    assert "scores" in response.data[0]
