import pytest
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.reverse import reverse
from rest_framework import status


@pytest.mark.django_db
def test_set_created_success(client, tournament_with_8_players_2_groups_1_draw):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:set_list")
    # When
    response = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": setup["user1"].id,
            "score_p1": 6,
            "score_p2": 4,
            "tournament": setup["tournament"].id,
            "group": setup["group1"].id,
            "draw_match": "",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    response2 = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": setup["user1"].id,
            "score_p1": 6,
            "score_p2": 4,
            "tournament": setup["tournament"].id,
            "group": "",
            "draw_match": setup["draw"].matches.all()[0].id,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["player_1"] == setup["user0"].id
    assert response.data["player_2"] == setup["user1"].id
    assert response.data["score_p1"] == 6
    assert response.data["score_p2"] == 4
    assert response.data["tournament"] == setup["tournament"].id
    assert response.data["group"] == setup["group1"].id
    assert response.data["draw_match"] == None

    assert response2.status_code == status.HTTP_201_CREATED
    assert response2.data["player_1"] == setup["user0"].id
    assert response2.data["player_2"] == setup["user1"].id
    assert response2.data["score_p1"] == 6
    assert response2.data["score_p2"] == 4
    assert response2.data["tournament"] == setup["tournament"].id
    assert response2.data["group"] == None
    assert response2.data["draw_match"] == setup["draw"].matches.all()[0].id


@pytest.mark.django_db
@pytest.mark.parametrize(
    "score", [(6, 0), (6, 1), (6, 2), (6, 3), (6, 4), (7, 5), (7, 6)]
)
def test_set_valid_scores(client, tournament_with_8_players_2_groups_1_draw, score):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:set_list")
    # When
    response = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": setup["user1"].id,
            "score_p1": score[0],
            "score_p2": score[1],
            "tournament": setup["tournament"].id,
            "group": setup["group1"].id,
            "draw_match": "",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["player_1"] == setup["user0"].id
    assert response.data["player_2"] == setup["user1"].id
    assert response.data["score_p1"] == score[0]
    assert response.data["score_p2"] == score[1]
    assert response.data["tournament"] == setup["tournament"].id
    assert response.data["group"] == setup["group1"].id
    assert response.data["draw_match"] == None


@pytest.mark.django_db
@pytest.mark.parametrize(
    "score", [(6, -1), (6, 6), (6, 8), (0, 0), (5, 5), (7, 4), (7, 8)]
)
def test_set_invalid_scores(client, tournament_with_8_players_2_groups_1_draw, score):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:set_list")
    # When
    response = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": setup["user1"].id,
            "score_p1": score[0],
            "score_p2": score[1],
            "tournament": setup["tournament"].id,
            "group": setup["group1"].id,
            "draw_match": "",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_set_player_not_in_group(client, tournament_with_8_players_2_groups_1_draw):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:set_list")
    # When
    response = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": setup["user4"].id,
            "score_p1": 6,
            "score_p2": 4,
            "tournament": setup["tournament"].id,
            "group": setup["group1"].id,
            "draw_match": "",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_set_player_not_registered(
    client, tournament_with_8_players_2_groups_1_draw, create_user
):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:set_list")
    player = create_user()
    # When
    response = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": player.id,
            "score_p1": 6,
            "score_p2": 4,
            "tournament": setup["tournament"].id,
            "group": setup["group1"].id,
            "draw_match": "",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_set_group_and_drawmatch_empty(
    client, tournament_with_8_players_2_groups_1_draw
):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:set_list")
    # When
    response = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": setup["user1"].id,
            "score_p1": 6,
            "score_p2": 4,
            "tournament": setup["tournament"].id,
            "group": "",
            "draw_match": "",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_set_drawmatch_missing(client, tournament_with_8_players_2_groups_1_draw):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:set_list")
    # When
    response = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": setup["user1"].id,
            "score_p1": 6,
            "score_p2": 4,
            "tournament": setup["tournament"].id,
            "group": "",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_set_unique_sets_in_group(
    client, tournament_with_8_players_2_groups_1_draw_sets_filled
):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw_sets_filled
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:set_list")
    # When
    response = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": setup["user1"].id,
            "score_p1": 6,
            "score_p2": 4,
            "tournament": setup["tournament"].id,
            "group": setup["group1"].id,
            "draw_match": "",
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert len(setup["group1"].set_stats.all()) == 6


@pytest.mark.django_db
def test_set_unique_sets_in_draw_round(
    client, tournament_with_8_players_2_groups_1_draw_sets_filled
):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw_sets_filled
    access = AccessToken.for_user(setup["user0"])
    path = reverse("tennis:set_list")
    # When
    response = client.post(
        path,
        data={
            "player_1": setup["user0"].id,
            "player_2": setup["user1"].id,
            "score_p1": 6,
            "score_p2": 4,
            "tournament": setup["tournament"].id,
            "group": "",
            "draw_match": setup["draw"].matches.all()[0].id,
        },
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_set_get_detail_and_destroy(
    client, tournament_with_8_players_2_groups_1_draw_sets_filled
):
    # Given
    setup = tournament_with_8_players_2_groups_1_draw_sets_filled
    access = AccessToken.for_user(setup["user0"])
    path = reverse(
        "tennis:set_detail",
        kwargs={"pk": setup["group1"].set_stats.all()[0].id},
    )
    # When
    response = client.get(path)
    # Then
    assert response.status_code == status.HTTP_200_OK
    assert (
        response.data["player_1"]["id"]
        == setup["group1"].set_stats.all()[0].player_1.id
    )

    # When
    response = client.delete(path, HTTP_AUTHORIZATION=f"Bearer {access}")
    # Then
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # When
    response = client.get(path)
    # Then
    assert response.status_code == status.HTTP_404_NOT_FOUND
