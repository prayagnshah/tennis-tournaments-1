from django.forms import ValidationError
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import generics, status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.http import Http404
from rest_framework.permissions import BasePermission, IsAuthenticated, SAFE_METHODS

from .serializers import (
    UserSerializer,
    LogInSerializer,
    Tournamentserializer,
    RegistrationSerializer,
    RegistrationSerializerForUser,
    SetStatSerializer,
    TournamentGroupSerializer,
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
)


# Create your views here.
class SignUpView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer


class LogInView(TokenObtainPairView):
    serializer_class = LogInSerializer


class TournamentsListView(APIView):
    """List of all tournaments"""

    def get(self, request, format=None):
        tournaments = Tournaments.objects.all()
        serializer = Tournamentserializer(tournaments, many=True)
        return Response(serializer.data)


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


class TournamnetDetailView(APIView):
    """
    Retrieve, update or delete a torunamnet instance.
    """

    def get_object(self, pk):
        try:
            return Tournaments.objects.get(pk=pk)
        except Tournaments.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        tournament = get_object_or_404(Tournaments, pk=pk)
        serializer = Tournamentserializer(tournament)
        return Response(serializer.data)


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
        registrations = Registration.objects.filter(user=pk)
        # print(registrations)
        serializer = RegistrationSerializerForUser(registrations, many=True)
        return Response(serializer.data, status.HTTP_200_OK)


# permissions for Set Stat - Admin can create and destroy instance, anyone can read
class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


class SetStatListView(generics.CreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = SetStat.objects.all()
    serializer_class = SetStatSerializer


class SetStatDetailView(generics.RetrieveDestroyAPIView):
    """Retrive, delete the given set"""

    permission_classes = [permissions.IsAdminUser | ReadOnly]
    queryset = SetStat.objects.all()
    serializer_class = SetStatSerializer


class TournamentGroupView(APIView):
    """Returns all  the groups for the given tournament - pk is for tournament ID"""

    def get(self, request, pk, format=None):
        groups = TournamentGroup.objects.filter(tournament=pk)
        serializer = TournamentGroupSerializer(groups, many=True)
        return Response(serializer.data, status.HTTP_200_OK)


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
    def get(self, request, pk, format=None):
        draw = get_object_or_404(EliminationDraw, pk=pk)
        serializer = EliminationDrawSerializer(draw)
        return Response(serializer.data, status.HTTP_200_OK)
