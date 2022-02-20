from genericpath import exists
from django.forms import ValidationError
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import generics, status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.http import Http404

from .serializers import (
    UserSerializer,
    LogInSerializer,
    Tournamentserializer,
    RegistrationSerializer,
    RegistrationSerializerForUser,
)
from rest_framework.views import APIView
from .models import Registration, Tournaments, User


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
        print(registrations)
        serializer = RegistrationSerializerForUser(registrations, many=True)
        return Response(serializer.data, status.HTTP_200_OK)
