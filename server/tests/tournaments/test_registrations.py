import email
from venv import create
from rest_framework.reverse import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
import pytest

# from model_bakery import baker


reg_list_path = reverse("tennis:registrations_list")

#################
# POST requests #
#################


@pytest.mark.django_db
def test_user_can_register_for_tournament(client, create_user, add_tournament):
    # Given
    user = create_user()
    tournament = add_tournament()
    access = AccessToken.for_user(user)
    # When
    response = client.post(
        reg_list_path,
        data={"tournament": tournament.id},
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["user"]["id"] == user.id
    assert response.data["tournament"] == tournament.id
    assert response.data["status"] == "REGISTERED"
    assert response.data["registered_on"]
    assert response.data["cancelled_on"] == None


@pytest.mark.django_db
def test_unauth_cant_register_for_torunament(client, add_tournament):
    # Given
    tournament = add_tournament()
    # When
    response = client.post(
        reg_list_path,
        data={"tournament": tournament.id},
        HTTP_AUTHORIZATION=f"Bearer {'not valid data'}",
    )
    # Then
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert len(str(response.data)) > 5


@pytest.mark.django_db
def test_cant_register_for_nonexist_tournament(client, create_user):
    # Given
    user = create_user()
    access = AccessToken.for_user(user)
    # When
    response = client.post(
        reg_list_path,
        data={"tournament": "100"},
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert len(str(response.data)) > 5


@pytest.mark.django_db
def test_cant_register_twice(client, create_user, add_tournament, create_registration):
    # Given
    user = create_user()
    access = AccessToken.for_user(user)
    tournament = add_tournament()
    create_registration(user=user, tournament=tournament)
    # When
    response = client.post(
        reg_list_path,
        data={"tournament": tournament.id},
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "unique" in str(response.data)
    assert "error" in str(response.data)
    assert len(str(response.data)) > 5


@pytest.mark.django_db
def test_cant_register_for_completed_tournament(client, create_user, add_tournament):
    # Given
    user = create_user()
    access = AccessToken.for_user(user)
    tournament = add_tournament(status="COMPLETED")
    # When
    response = client.post(
        reg_list_path,
        data={"tournament": tournament.id},
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "completed" in str(response.data)
    assert "error" in str(response.data)
    assert len(str(response.data)) > 5


@pytest.mark.django_db
def test_set_interested_on_full_capacity(
    client, create_user, add_tournament, create_registration
):
    # Given
    user1 = create_user(email="usr1@t.com")
    user2 = create_user(email="user2@t.com")
    tournament = add_tournament(capacity=1)
    create_registration(user=user1, tournament=tournament)
    access = AccessToken.for_user(user2)
    # When
    response = client.post(
        reg_list_path,
        data={"tournament": tournament.id, "status": "REGISTERED"},
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["user"]["id"] == user2.id
    assert response.data["status"] == "INTERESTED"


@pytest.mark.django_db
def test_set_registered_on_free_capacity(
    client, create_user, add_tournament, create_registration
):
    # Given
    user1 = create_user(email="usr1@t.com")
    user2 = create_user(email="user2@t.com")
    tournament = add_tournament(capacity=2)
    create_registration(user=user1, tournament=tournament)
    access = AccessToken.for_user(user2)
    # When
    response = client.post(
        reg_list_path,
        data={"tournament": tournament.id, "status": "INTERESTED"},
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["user"]["id"] == user2.id
    assert response.data["status"] == "REGISTERED"


@pytest.mark.django_db
def test_renew_cancelled_reg(client, create_user, add_tournament, create_registration):
    # Given
    user = create_user(email="usr1@t.com")
    tournament = add_tournament()
    registration = create_registration(
        user=user, tournament=tournament, status="CANCELLED"
    )
    access = AccessToken.for_user(user)
    # When
    response = client.post(
        reg_list_path,
        data={"tournament": tournament.id},
        HTTP_AUTHORIZATION=f"Bearer {access}",
    )
    # Then
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["user"]["id"] == user.id
    assert response.data["status"] == "REGISTERED"
    assert response.data["id"] == registration.id


#################
# GET requests #
#################


@pytest.mark.django_db
def test_can_get_all_registrations_for_tournament(
    client, create_user, add_tournament, create_registration
):
    # Given
    user1 = create_user()
    print(user1.email)
    user2 = create_user(email="user2@test.com")
    tournament1 = add_tournament()
    tournament2 = add_tournament()
    create_registration(user=user1, tournament=tournament1)
    create_registration(user=user2, tournament=tournament1)
    create_registration(user=user1, tournament=tournament2)
    # When
    response = client.get(f"{reg_list_path}?tournament_id={tournament1.id}")
    # Then
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2
    assert response.data[0]["user"]["id"] == user1.id
    assert response.data[0]["tournament"] == tournament1.id
    assert response.data[1]["user"]["id"] == user2.id
    assert response.data[1]["tournament"] == tournament1.id


@pytest.mark.django_db
def test_registrations_for_nonexist_tournament(client):
    # When
    response = client.get(f"{reg_list_path}?tournament_id=1")
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert len(str(response.data)) > 5
    assert "error" in str(response.data)
    assert "tournament_id" in str(response.data)


def test_missing_argument_tournamnet_id(client):
    # When
    response = client.get(reg_list_path)
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert len(str(response.data)) > 5
    assert "error" in str(response.data)
    assert "tournament_id" in str(response.data)


@pytest.mark.django_db
def test_can_get_registration(client, create_user, add_tournament, create_registration):
    # Given
    user = create_user()
    tournament = add_tournament()
    registration = create_registration(user=user, tournament=tournament)
    # When
    response = client.get(f"{reg_list_path}{registration.id}/")
    # Then
    assert response.status_code == status.HTTP_200_OK
    print(response.data)
    assert response.data["id"] == registration.id
    assert response.data["user"]["id"] == user.id
    assert response.data["tournament"] == tournament.id


@pytest.mark.django_db
def test_get_invalid_reg_id(client):
    # When
    response = client.get(f"{reg_list_path}1/")
    # Then
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert len(str(response.data)) > 5
    assert "Not found" in str(response.data)


#################
# PUT requests #
#################
@pytest.mark.django_db
def test_update_status_to_cancelled(
    client, create_user, create_registration, add_tournament
):
    # Given
    user = create_user()
    tournament = add_tournament()
    registration = create_registration(user=user, tournament=tournament)
    access = AccessToken.for_user(user)
    # When
    response = client.put(
        f"{reg_list_path}{registration.id}/",
        data={"tournament": tournament.id},
        HTTP_AUTHORIZATION=f"Bearer {access}",
        content_type="application/json",
    )
    # Then
    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == registration.id
    assert response.data["user"]["id"] == user.id
    assert response.data["status"] == "CANCELLED"
    assert response.data["cancelled_on"]


@pytest.mark.django_db
def test_cant_update_tournament_id(
    client, create_user, create_registration, add_tournament
):
    # Given
    user = create_user()
    tournament1 = add_tournament()
    tournament2 = add_tournament()
    registration = create_registration(user=user, tournament=tournament1)
    access = AccessToken.for_user(user)
    # When
    response = client.put(
        f"{reg_list_path}{registration.id}/",
        data={"tournament": tournament2.id},
        HTTP_AUTHORIZATION=f"Bearer {access}",
        content_type="application/json",
    )
    # Then
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert tournament1.id != tournament2.id
    assert "error" in str(response.data)
    assert "tournament" in str(response.data)


@pytest.mark.django_db
def test_cant_update_unauth(client, create_user, create_registration, add_tournament):
    # Given
    user = create_user()
    tournament = add_tournament()
    registration = create_registration(user=user, tournament=tournament)
    # When
    response = client.put(
        f"{reg_list_path}{registration.id}/",
        data={"tournament": tournament.id},
        content_type="application/json",
    )
    # Then
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_cant_update_tournament_status(
    client, create_user, create_registration, add_tournament
):
    # Given
    user = create_user()
    tournament = add_tournament()
    registration = create_registration(
        user=user, tournament=tournament, status="REGISTERED"
    )
    access = AccessToken.for_user(user)
    # When
    response = client.put(
        f"{reg_list_path}{registration.id}/",
        data={"tournament": tournament.id, "status": "INTERESTED"},
        HTTP_AUTHORIZATION=f"Bearer {access}",
        content_type="application/json",
    )
    # Then
    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "CANCELLED"
    assert response.data["id"] == registration.id
    assert response.data["tournament"] == tournament.id
