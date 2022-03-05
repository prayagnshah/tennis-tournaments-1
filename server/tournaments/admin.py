from attr import field, fields
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin

from .models import (
    User,
    Tournaments,
    Registration,
    TournamentGroup,
    SetStat,
    EliminationDraw,
    EliminationDrawMatch,
    GroupScores,
)

# Register your models here.
@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    # fields = ("id", "first_name", "last_name")
    list_display = ("id", "email", "first_name", "last_name", "is_staff")
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
        "get_tournament",
        "registered_on",
        "cancelled_on",
        "status",
    )
    readonly_fields = ("id",)

    @admin.display(description="Tournament_id")
    def get_tournament(self, obj):
        return obj.tournament.id


@admin.register(TournamentGroup)
class TournamentGroupAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "get_players", "get_tournament")

    @admin.display(description="Players")
    def get_players(self, obj):
        return ",\n".join([str(p) for p in obj.players.all()])

    @admin.display(description="Tournament_id")
    def get_tournament(self, obj):
        return obj.tournament.id


@admin.register(SetStat)
class SetStatAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "player_1",
        "player_2",
        "get_score",
        "get_tournament",
        "group",
        "draw_match",
    )

    @admin.display(description="Tournament_id")
    def get_tournament(self, obj):
        return obj.tournament.id

    @admin.display(description="Score")
    def get_score(self, obj):
        return f"{obj.score_p1} : {obj.score_p2}"


@admin.register(EliminationDraw)
class EliminationDrawAdmin(admin.ModelAdmin):
    list_display = ("id", "size", "type_of", "tournament")


@admin.register(EliminationDrawMatch)
class EliminationDrawMatchAdmin(admin.ModelAdmin):
    list_display = ("id", "match", "round_of", "get_players", "draw", "set_stat")
    # fields = ("id", "match", "round_of", "players", "draw", "set_stat")

    @admin.display(description="Players")
    def get_players(self, obj):
        return " vs ".join([str(p) for p in obj.players.all()])


@admin.register(GroupScores)
class GroupScoresAdmin(admin.ModelAdmin):
    list_display = ("id", "player", "group", "sets_won", "games", "position")
