from attr import field, fields
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin

from .models import User, Tournaments, Registration

# Register your models here.
@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    pass


@admin.register(Tournaments)
class TournamentsAdmin(admin.ModelAdmin):
    # fields = (
    #     "id",
    #     "category",
    #     "competitors",
    #     "event_date",
    #     "prestige",
    #     "capacity",
    #     "status",
    # )
    list_display = (
        "id",
        "name",
        "category",
        "event_date",
        "prestige",
        "capacity",
        "status",
    )
    list_filter = (
        "category",
        "status",
    )
    readonly_fields = ("id",)


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "tournament",
        "registered_on",
        "cancelled_on",
        "status",
    )
    readonly_fields = ("id",)
