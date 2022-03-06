from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import validate_email
from django.shortcuts import reverse
from django.conf import settings
from django.utils import timezone
from tournaments.utils import fill_torunament

# Create your models here.
class User(AbstractUser):
    email = models.EmailField(
        unique=True,
        blank=False,
        max_length=254,
        verbose_name="email_address",
        validators=[validate_email],
    )

    def __str__(self):
        return self.email

    @property
    def group(self):
        groups = self.groups.all()
        return groups[0].name if groups else None


class Tournaments(models.Model):
    # Categories
    START = "START"
    SPORT = "SPORT"
    CHALLENGER = "CHALLENGER"
    TOURNAMNET_CATEGORIES = (
        (START, START),
        (SPORT, SPORT),
        (CHALLENGER, CHALLENGER),
    )

    # Surfaces
    CLAY = "CLAY"
    HARD = "HARD"
    ARTIFICAL_TURF = "ARTIFICAL_TURF"
    GRASS = "GRASS"
    SURFACES = (
        (CLAY, CLAY),
        (HARD, HARD),
        (ARTIFICAL_TURF, ARTIFICAL_TURF),
        (GRASS, GRASS),
    )

    # Statuses
    OPEN = "OPEN"
    CONSOLIDATED = "CONSOLIDATED"
    COMPLETED = "COMPLETED"
    STATUSES = ((OPEN, OPEN), (CONSOLIDATED, CONSOLIDATED), (COMPLETED, COMPLETED))

    # ID is the automatic primary key
    category = models.CharField(
        max_length=20, choices=TOURNAMNET_CATEGORIES, blank=False
    )
    name = models.CharField(max_length=100, blank=False, default="CUP")
    # competitors = models.ManyToManyField(
    #     "User", blank=True, related_name="competitions"
    # )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    event_date = models.DateTimeField(blank=False)
    place = models.CharField(max_length=100, blank=False)
    prestige = models.IntegerField(blank=False)
    surface = models.CharField(max_length=20, choices=SURFACES, blank=False)
    capacity = models.IntegerField(blank=False)
    status = models.CharField(
        max_length=20, choices=STATUSES, blank=False, default=OPEN
    )
    price = models.IntegerField(blank=False)

    __original_capacity = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__original_capacity = self.capacity

    # If the torunament capacity changes, change the registration statuses accordingly
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.capacity != self.__original_capacity:
            fill_torunament(self)
        self.__original_capacity = self.capacity

    def __str__(self):
        return f"Tournament(id: {self.id}) of category {self.category} on {self.event_date} at {self.place}"

    def get_absolute_url(self):
        return reverse("tournament_detail", kwargs={"tournament_id": self.id})


class Registration(models.Model):
    # Registration statuses
    REGISTERED = "REGISTERED"
    INTERESTED = "INTERESTED"
    CANCELLED = "CANCELLED"
    REGISTRATION_STATUSES = (
        (REGISTERED, REGISTERED),
        (INTERESTED, INTERESTED),
        (CANCELLED, CANCELLED),
    )

    # ID is the automatic primary key
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        on_delete=models.DO_NOTHING,
        related_name="tournaments",
    )
    tournament = models.ForeignKey(
        "Tournaments",
        blank=False,
        on_delete=models.CASCADE,
        related_name="registrations",
    )
    registered_on = models.DateTimeField(auto_now_add=True)
    cancelled_on = models.DateTimeField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=REGISTRATION_STATUSES,
        blank=False,
        null=False,
        default=REGISTERED,
    )

    class Meta:
        unique_together = ["user", "tournament"]
        ordering = ["registered_on"]

    def save(self, *args, **kwargs):
        # setting the datime if status CANCELLED is chosen
        if self.status == self.CANCELLED:
            self.cancelled_on = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"ID: {self.id} - user: {self.user.username} - torunament: {self.tournament.id} - {self.status}"


class TournamentGroup(models.Model):
    name = models.CharField(max_length=50)
    players = models.ManyToManyField("User")
    tournament = models.ForeignKey(
        "Tournaments", on_delete=models.DO_NOTHING, related_name="tournament_goroup"
    )

    def __str__(self):
        return f"{self.name}({self.id}) for {self.tournament.id}"


class SetStat(models.Model):
    """Tennis set"""

    player_1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.DO_NOTHING,
        related_name="set_stat_p1",
    )
    player_2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.DO_NOTHING,
        related_name="set_stat_p2",
    )
    score_p1 = models.IntegerField(choices=[(i, i) for i in range(0, 8)])
    score_p2 = models.IntegerField(choices=[(i, i) for i in range(0, 8)])
    tournament = models.ForeignKey("Tournaments", on_delete=models.CASCADE)
    group = models.ForeignKey(
        "TournamentGroup",
        on_delete=models.CASCADE,
        related_name="set_stats",
        null=True,
        blank=True,
    )
    draw_match = models.OneToOneField(
        "EliminationDrawMatch",
        on_delete=models.CASCADE,
        related_name="set_stat",
        null=True,
        blank=True,
    )

    def __str__(self):
        if self.draw_match:
            return f"Set for torunament {self.tournament.id} - draw match - {self.player_1.username} : {self.player_2.username}"
        elif self.group:
            return f"Set for torunament {self.tournament.id} - {self.group.name} - {self.player_1.username} : {self.player_2.username}"
        else:
            return f"Set for torunament {self.tournament.id} - no group or draw match"


class EliminationDraw(models.Model):
    MAIN = "MAIN"
    SECONDARY = "SECONDARY"
    DRAW_TYPES = (
        (MAIN, MAIN),
        (SECONDARY, SECONDARY),
    )

    players = models.ManyToManyField("User")
    size = models.IntegerField(
        choices=[(4, 4), (8, 8), (16, 16), (32, 32)], blank=False, null=False
    )
    tournament = models.ForeignKey(
        "Tournaments", on_delete=models.CASCADE, blank=False, null=False
    )
    type_of = models.CharField(
        max_length=20, choices=DRAW_TYPES, blank=False, null=False
    )

    def __str__(self):
        return f"{self.type_of} Draw for torunament {self.tournament.id}"

    # On create generate the sufficient number of EliminationDrawMatches
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            size = int(self.size / 2)
            round_of = 0
            match_id = 0
            while size > 0:
                round_of += 1
                for _ in range(size):
                    match_id += 1
                    match = EliminationDrawMatch(
                        round_of=round_of, match=match_id, draw=self
                    )
                    match.save()
                    print(match_id)
                if size == 1:
                    size = 0
                else:
                    size = int(size / 2)


class EliminationDrawMatch(models.Model):
    players = models.ManyToManyField("User")
    round_of = models.IntegerField(blank=False, null=False)
    match = models.IntegerField(blank=True, null=False)
    draw = models.ForeignKey(
        "EliminationDraw",
        blank=True,
        null=False,
        on_delete=models.CASCADE,
        related_name="matches",
    )

    def __str__(self):
        return f"{self.draw.type_of} Draw match({self.match}) for torunament {self.draw.tournament.id}"


class GroupScores(models.Model):
    """Manages the scores for a player on a group of tournament"""

    player = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="group_scores"
    )
    group = models.ForeignKey(
        "TournamentGroup", on_delete=models.CASCADE, related_name="scores"
    )
    tournament = models.ForeignKey(
        "Tournaments", on_delete=models.CASCADE, related_name="group_scores"
    )
    sets_won = models.PositiveIntegerField(default=0)
    games = models.IntegerField(default=0)
    position = models.PositiveIntegerField(default=0)
