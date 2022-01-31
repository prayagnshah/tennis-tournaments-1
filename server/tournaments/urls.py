from django.urls import path

from .views import TournamentsListView, TournamnetDetailView


app_name = 'tennis'

urlpatterns = [
    path('tournament/<int:pk>/', TournamnetDetailView.as_view(), name='tournament_detail'),
    path('tournaments/', TournamentsListView.as_view(), name='tournaments_list')
]