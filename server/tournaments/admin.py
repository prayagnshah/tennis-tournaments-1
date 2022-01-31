from attr import field, fields
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin

from.models import User, Tournamnets

# Register your models here.
@admin.register(User)
class UserAdmin(DefaultUserAdmin):
	pass


@admin.register(Tournamnets)
class TournamentsAdmin(admin.ModelAdmin):
	ields = ('id', 'category', 'user', 'event_date', 'prestige', 'capacity', 'status',)
	list_display = ('id', 'category', 'event_date', 'prestige', 'capacity', 'status',)
	list_filter = ('category', 'status',)
	readonly_fields = ('id',)
