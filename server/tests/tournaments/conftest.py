import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
import itertools

from tournaments.models import (
    Tournaments,
    Registration,
    TournamentGroup,
    EliminationDraw,
    SetStat,
)

PASSWORD = "pAssw0rd!"


@pytest.fixture
def api_client():
    return APIClient


@pytest.fixture(scope="function")
def add_tournament():
    def _add_tournament(
        name="Test",
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
            name=name,
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


@pytest.fixture(scope="function")
def tournament_with_8_players():
    to_return = {}
    tournament = Tournaments.objects.create(
        name="Test",
        category="START",
        event_date="2022-02-04T09:00:00Z",
        place="testplace",
        prestige=100,
        surface="CLAY",
        status="CONSOLIDATED",
        capacity=8,
        price=1000,
    )
    to_return["tournament"] = tournament
    for i in range(8):
        user = get_user_model().objects.create_user(
            username=f"test{i}@example.com",
            email=f"test{i}@example.com",
            first_name=f"Test{i}",
            last_name=f"test-{i}",
            password=PASSWORD,
        )
        to_return[f"user{i}"] = user
        to_return[f"registration{i}"] = Registration.objects.create(
            user=user, tournament=tournament, status="REGISTERED"
        )

    to_return["user0"].is_staff = True
    to_return["user0"].save()

    return to_return


@pytest.fixture(scope="function")
def tournament_with_8_players_2_groups_1_draw(tournament_with_8_players):
    to_return = tournament_with_8_players
    group1 = TournamentGroup.objects.create(
        name="TestGroup1", tournament=to_return["tournament"]
    )
    group1.players.add(
        to_return["user0"], to_return["user1"], to_return["user2"], to_return["user3"]
    )
    to_return["group1"] = group1

    group2 = TournamentGroup.objects.create(
        name="TestGroup2", tournament=to_return["tournament"]
    )
    group2.players.add(
        to_return["user4"], to_return["user5"], to_return["user6"], to_return["user7"]
    )
    to_return["group2"] = group2

    draw = EliminationDraw.objects.create(
        size=8, tournament=to_return["tournament"], type_of="MAIN"
    )
    draw.players.add(
        to_return["user0"],
        to_return["user1"],
        to_return["user2"],
        to_return["user3"],
        to_return["user4"],
        to_return["user5"],
        to_return["user6"],
        to_return["user7"],
    )
    to_return["draw"] = draw

    return to_return


@pytest.fixture(scope="function")
def tournament_with_8_players_2_groups_1_draw_sets_filled(
    tournament_with_8_players_2_groups_1_draw,
):
    data = tournament_with_8_players_2_groups_1_draw
    group1_players = data["group1"].players.all()
    for comb in list(itertools.combinations(group1_players, 2)):
        setstat = SetStat.objects.create(
            player_1=comb[0],
            player_2=comb[1],
            score_p1=6,
            score_p2=4,
            tournament=data["tournament"],
            group=data["group1"],
        )
    group2_players = data["group2"].players.all()
    for comb in list(itertools.combinations(group2_players, 2)):
        SetStat.objects.create(
            player_1=comb[0],
            player_2=comb[1],
            score_p1=6,
            score_p2=4,
            tournament=data["tournament"],
            group=data["group2"],
        )

    SetStat.objects.create(
        player_1=data["user0"],
        player_2=data["user1"],
        score_p1=6,
        score_p2=4,
        tournament=data["tournament"],
        draw_match=data["draw"].matches.all().get(match=1),
    )
    SetStat.objects.create(
        player_1=data["user2"],
        player_2=data["user3"],
        score_p1=6,
        score_p2=4,
        tournament=data["tournament"],
        draw_match=data["draw"].matches.all().get(match=2),
    )
    SetStat.objects.create(
        player_1=data["user4"],
        player_2=data["user5"],
        score_p1=6,
        score_p2=4,
        tournament=data["tournament"],
        draw_match=data["draw"].matches.all().get(match=3),
    )
    SetStat.objects.create(
        player_1=data["user6"],
        player_2=data["user7"],
        score_p1=6,
        score_p2=4,
        tournament=data["tournament"],
        draw_match=data["draw"].matches.all().get(match=4),
    )
    SetStat.objects.create(
        player_1=data["user0"],
        player_2=data["user2"],
        score_p1=6,
        score_p2=4,
        tournament=data["tournament"],
        draw_match=data["draw"].matches.all().get(match=5),
    )
    SetStat.objects.create(
        player_1=data["user4"],
        player_2=data["user6"],
        score_p1=6,
        score_p2=4,
        tournament=data["tournament"],
        draw_match=data["draw"].matches.all().get(match=6),
    )
    SetStat.objects.create(
        player_1=data["user0"],
        player_2=data["user4"],
        score_p1=6,
        score_p2=4,
        tournament=data["tournament"],
        draw_match=data["draw"].matches.all().get(match=7),
    )

    return data
