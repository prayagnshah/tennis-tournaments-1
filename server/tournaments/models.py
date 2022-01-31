from wsgiref.validate import validator
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import validate_email
from django.shortcuts import reverse

# Create your models here.
class User(AbstractUser):
	email = models.EmailField(unique=True, blank=False, max_length=254, verbose_name='email address', validators=[validate_email])


class Tournamnets(models.Model):
	#Categories
	START = 'START'
	SPORT = 'SPORT'
	CHALLENGER = 'CHALLENGER'
	TOURNAMNET_CATEGORIES = (
		(START, START),
		(SPORT, SPORT),
		(CHALLENGER, CHALLENGER),
	)

	#Surfaces
	CLAY = 'CLAY'
	HARD = 'HARD'
	ARTIFICAL_TURF = 'ARTIFICAL_TURF'
	GRASS = 'GRASS'
	SURFACES = (
		(CLAY, CLAY),
		(HARD, HARD),
		(ARTIFICAL_TURF, ARTIFICAL_TURF),
		(GRASS, GRASS)
	)

	#Statuses
	OPEN = 'OPEN'
	CONSOLIDATED = 'CONSOLIDATED'
	COMPLETED = 'COMPLETED'
	STATUSES = (
		(OPEN, OPEN),
		(CONSOLIDATED, CONSOLIDATED),
		(COMPLETED, COMPLETED)
	)

	# ID is the automatic primary key
	category = models.CharField(max_length=20, choices=TOURNAMNET_CATEGORIES, blank=False)
	competitors = models.ManyToManyField('User', blank=True, related_name='competitions')
	created = models.DateTimeField(auto_now_add=True)
	updated = models.DateTimeField(auto_now=True)
	event_date = models.DateTimeField(blank=False)
	place = models.CharField(max_length=100, blank=False)
	prestige = models.IntegerField(blank=False)
	surface = models.CharField(max_length=20, choices=SURFACES, blank=False)
	capacity = models.IntegerField(blank=False)
	status = models.CharField(max_length=20, choices=STATUSES, blank=False, default=OPEN)
	price = models.IntegerField(blank=False)

	def __str__(self):
		return f'Tournament of category {self.category} on {self.event_date} at {self.place}'

	def get_absolute_url(self):
		return reverse('tournament_detail', kwargs={'tournament_id': self.id}) 

	