from tournaments.utils import fill_torunament
import pytest
from tournaments.models import Registration


@pytest.mark.django_db
def test_fill_tournament_free_cap_greater_then_0_interested_less_then_free_cap(
    add_tournament, create_user, create_registration
):
    # Given
    tournament = add_tournament(capacity=2)
    user1 = create_user(email="user1@t.com")
    user2 = create_user(email="user2@t.com")
    registration1 = create_registration(
        user=user1, tournament=tournament, status="INTERESTED"
    )
    registration2 = create_registration(
        user=user2, tournament=tournament, status="CANCELLED"
    )
    # When
    fill_torunament(tournament)
    # Then
    resp_registration1 = Registration.objects.get(pk=registration1.id)
    resp_registration2 = Registration.objects.get(pk=registration2.id)
    assert resp_registration1.status == "REGISTERED"
    assert resp_registration2.status == "CANCELLED"


@pytest.mark.django_db
def test_fill_tournament_free_cap_greater_then_0_interested_more_then_free_cap(
    add_tournament, create_user, create_registration
):
    # Given
    tournament = add_tournament(capacity=2)
    user1 = create_user(email="user1@t.com")
    user2 = create_user(email="user2@t.com")
    user3 = create_user(email="user3@t.com")
    user4 = create_user(email="user4@t.com")
    registration1 = create_registration(
        user=user1, tournament=tournament, status="INTERESTED"
    )
    registration2 = create_registration(
        user=user2, tournament=tournament, status="INTERESTED"
    )
    registration3 = create_registration(
        user=user3, tournament=tournament, status="INTERESTED"
    )
    registration4 = create_registration(
        user=user4, tournament=tournament, status="CANCELLED"
    )
    # When
    fill_torunament(tournament)
    # Then
    resp_registration1 = Registration.objects.get(pk=registration1.id)
    resp_registration2 = Registration.objects.get(pk=registration2.id)
    resp_registration3 = Registration.objects.get(pk=registration3.id)
    resp_registration4 = Registration.objects.get(pk=registration4.id)
    assert resp_registration1.status == "REGISTERED"
    assert resp_registration2.status == "REGISTERED"
    assert resp_registration3.status == "INTERESTED"
    assert resp_registration4.status == "CANCELLED"


@pytest.mark.django_db
def test_fill_tournamnet_free_cap_less_then_registered(
    add_tournament, create_user, create_registration
):
    # Given
    tournament = add_tournament(capacity=2)
    user1 = create_user(email="user1@t.com")
    user2 = create_user(email="user2@t.com")
    user3 = create_user(email="user3@t.com")
    user4 = create_user(email="user4@t.com")
    registration1 = create_registration(
        user=user1, tournament=tournament, status="REGISTERED"
    )
    registration2 = create_registration(
        user=user2, tournament=tournament, status="REGISTERED"
    )
    registration3 = create_registration(
        user=user3, tournament=tournament, status="REGISTERED"
    )
    registration4 = create_registration(
        user=user4, tournament=tournament, status="CANCELLED"
    )
    # When
    fill_torunament(tournament)
    # Then
    resp_registration1 = Registration.objects.get(pk=registration1.id)
    resp_registration2 = Registration.objects.get(pk=registration2.id)
    resp_registration3 = Registration.objects.get(pk=registration3.id)
    resp_registration4 = Registration.objects.get(pk=registration4.id)
    assert resp_registration1.status == "REGISTERED"
    assert resp_registration2.status == "REGISTERED"
    assert resp_registration3.status == "INTERESTED"
    assert resp_registration4.status == "CANCELLED"
