from unicodedata import name
from django.urls import path

from .views import (
    TournamentsListView,
    TournamnetDetailView,
    RegistrationDetailView,
    RegistrationListView,
    UserDetailView,
    RegistrationsForUserView,
    SetStatDetailView,
    TournamentGroupView,
)


app_name = "tennis"

urlpatterns = [
    # This row sould be deleted in production - used for testing
    path("user/<int:pk>/", UserDetailView.as_view(), name="usr_detail"),
    path(
        "tournament/<int:pk>/", TournamnetDetailView.as_view(), name="tournament_detail"
    ),
    path("tournaments/", TournamentsListView.as_view(), name="tournaments_list"),
    path(
        "registrations/<int:pk>/",
        RegistrationDetailView.as_view(),
        name="registration_detail",
    ),
    path("registrations/", RegistrationListView.as_view(), name="registrations_list"),
    path(
        "registrations/user/<int:pk>/",
        RegistrationsForUserView.as_view(),
        name="registrations_list_for_user",
    ),
    path("sets/<int:pk>", SetStatDetailView.as_view(), name="set_detail"),
    path(
        "groups-for-tournament/<int:pk>",
        TournamentGroupView.as_view(),
        name="grups_for_torunament",
    ),
]
