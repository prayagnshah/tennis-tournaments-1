from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.http import Http404

from .serializers import UserSerializer, LogInSerializer, TournamnetSerializer
from rest_framework.views import APIView
from .models import Tournamnets


# Create your views here.
class SignUpView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer


class LogInView(TokenObtainPairView):
    serializer_class = LogInSerializer


class TournamentsListView(APIView):
    """List of all tournaments"""

    def get(self, request, format=None):
        tournaments = Tournamnets.objects.all()
        serializer = TournamnetSerializer(tournaments, many=True)
        return Response(serializer.data)


class TournamnetDetailView(APIView):
    """
    Retrieve, update or delete a torunamnet instance.
    """

    def get_object(self, pk):
        try:
            return Tournamnets.objects.get(pk=pk)
        except Tournamnets.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        tournament = self.get_object(pk)
        serializer = TournamnetSerializer(tournament)
        return Response(serializer.data)
