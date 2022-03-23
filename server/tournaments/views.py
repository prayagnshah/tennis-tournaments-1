from audioop import reverse
from functools import partial
from django.forms import ValidationError
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import generics, status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.http import Http404
from rest_framework.permissions import BasePermission, IsAuthenticated, SAFE_METHODS
from .utils import manage_group_scores
from django.contrib.auth.models import Group

from .serializers import (
    UserSerializer,
    LogInSerializer,
    Tournamentserializer,
    RegistrationSerializer,
    RegistrationSerializerForUser,
    ReadSetStatSerializer,
    WriteSetStatSerializer,
    TournamentGroupListSerializer,
    TournamentGroupCreateSerializer,
    EliminationDrawMatchSerializer,
    EliminationDrawSerializer,
)
from rest_framework.views import APIView
from .models import (
    Registration,
    TournamentGroup,
    Tournaments,
    User,
    SetStat,
    EliminationDrawMatch,
    EliminationDraw,
    GroupScores,
)

### PERMISSIONS ###
# permissions for Set Stat - Admin can create and destroy instance, anyone can read
class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


class IsManagerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_authenticated:
            group = get_object_or_404(Group, name="Manager")
            return request.user.group == group.name

        return False


### VIEWS ###
class SignUpView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer


class LogInView(TokenObtainPairView):
    serializer_class = LogInSerializer


class UserDetailView(APIView):
    """SHOD BE DELETED to PRODUCTION - used for qucik testing.
    Returns user details"""

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        user = self.get_object(pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)


class TournamentsListView(generics.ListCreateAPIView):
    queryset = Tournaments.objects.all().order_by("event_date")
    serializer_class = Tournamentserializer
    permission_classes = [IsManagerOrReadOnly]


class TournamnetDetailView(APIView):
    """
    Retrieve, update or delete a torunamnet instance.
    """

    serializer_class = Tournamentserializer
    permission_classes = [IsManagerOrReadOnly]

    def get_object(self, pk):
        try:
            return Tournaments.objects.get(pk=pk)
        except Tournaments.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        tournament = get_object_or_404(Tournaments, pk=pk)
        serializer = Tournamentserializer(tournament)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        tournament = get_object_or_404(Tournaments, pk=pk)
        serializer = Tournamentserializer(tournament, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistrationListView(APIView):
    """
    Create registration instance,
    Return registrations for the given torunament
    """

    serializer_class = RegistrationSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
    ]

    def get(self, request, format=None):
        if request.query_params.get("tournament_id"):
            try:
                tournamnet = Tournaments.objects.get(
                    pk=request.query_params.get("tournament_id")
                )
            except Tournaments.DoesNotExist:
                error = {"error": "Given 'tournament_id' does not exists"}
                return Response(error, status=status.HTTP_400_BAD_REQUEST)

            registrations = Registration.objects.filter(tournament=tournamnet)
            serializer = RegistrationSerializer(registrations, many=True)
            return Response(serializer.data, status.HTTP_200_OK)
        else:
            error = {"error": "Argument 'tournament_id' is required"}
            return Response(error, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, format=None):
        serializer = RegistrationSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistrationDetailView(APIView):
    """Retrive, Create, Update a registration instance"""

    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
    ]
    serializer_class = RegistrationSerializer

    def get(self, request, pk, format=None):
        registration = get_object_or_404(Registration, pk=pk)
        serializer = RegistrationSerializer(registration)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        registration = get_object_or_404(Registration, pk=pk)
        serializer = RegistrationSerializer(
            registration, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistrationsForUserView(APIView):
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
    ]
    serializer_class = RegistrationSerializerForUser

    def get(self, request, pk, format=None):
        registrations = Registration.objects.filter(user=pk).order_by(
            "tournament__event_date"
        )
        # print(registrations)
        serializer = RegistrationSerializerForUser(registrations, many=True)
        return Response(serializer.data, status.HTTP_200_OK)


class SetStatListView(generics.CreateAPIView):
    permission_classes = [IsManagerOrReadOnly]
    queryset = SetStat.objects.all()
    serializer_class = WriteSetStatSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        if instance.group:
            manage_group_scores(instance, GroupScores)


class SetStatDetailView(generics.RetrieveDestroyAPIView):
    """Retrive, delete the given set"""

    permission_classes = [IsManagerOrReadOnly]
    queryset = SetStat.objects.all()
    serializer_class = ReadSetStatSerializer


class TournamentGroupView(APIView):
    """Returns all  the groups for the given tournament - pk is for tournament ID"""

    serializer_class = TournamentGroupCreateSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get(self, request, pk, format=None):
        get_object_or_404(Tournaments, pk=pk)
        groups = TournamentGroup.objects.filter(tournament=pk)
        serializer = TournamentGroupListSerializer(groups, many=True)
        return Response(serializer.data, status.HTTP_200_OK)

    def post(self, request, pk, format=None):
        get_object_or_404(Tournaments, pk=pk)
        serializer = TournamentGroupCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EliminationDrawMatchDetailView(APIView):
    """Returns the given match detail"""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = EliminationDrawMatchSerializer

    def get(self, request, pk, fomat=None):
        match = get_object_or_404(EliminationDrawMatch, pk=pk)
        serializer = EliminationDrawMatchSerializer(match)
        return Response(serializer.data, status.HTTP_200_OK)

    # Probably not required, the update can be done torugh SetStat update
    # maybe for updating players without match results
    def put(self, request, pk, format=None):
        match = get_object_or_404(EliminationDrawMatch, pk=pk)
        serializer = EliminationDrawMatchSerializer(match, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EliminationDrawDetailView(APIView):
    """Can get Draw by specifing tournament_id in query parameters or by pk
    Can create new Draw"""

    serializer_class = EliminationDrawSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get(self, request, pk=None, format=None):
        if request.query_params.get("tournament_id") and not pk:
            draw = EliminationDraw.objects.filter(
                tournament=request.query_params.get("tournament_id")
            )
            # try:
            #     draw = EliminationDraw.objects.filter(
            #         tournament=request.query_params.get("tournament_id")
            #     )
            # except EliminationDraw.DoesNotExist:
            #     # error = {"error": "Given 'tournament_id' does not exists"}
            #     # return Response(error, status=status.HTTP_400_BAD_REQUEST)
            #     # if no draw exists for the torunament, return nothing
            #     return Response(status=status.HTTP_200_OK)
        elif pk:
            draw = get_object_or_404(EliminationDraw, pk=pk)
        else:
            error = {"error": "Missing 'tournament_id' parameter"}
            return Response(error, status=status.HTTP_400_BAD_REQUEST)

        serializer = EliminationDrawSerializer(draw, many=True)
        return Response(serializer.data, status.HTTP_200_OK)

    def post(self, request, pk=None, format=None):
        if request.query_params.get("tournament_id") or pk:
            error = {"error": f"Post request should not be sent to this path."}
            return Response(error, status=status.HTTP_400_BAD_REQUEST)

        serializer = EliminationDrawSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
