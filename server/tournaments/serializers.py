from django.contrib.auth import get_user_model
from django.forms import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Tournaments,
    Registration,
    TournamentGroup,
    SetStat,
    EliminationDrawMatch,
    EliminationDraw,
    GroupScores,
)
from rest_framework.validators import UniqueTogetherValidator
from .utils import fill_torunament


class UserSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError("Passwords must match.")
        return data

    def create(self, validated_data):
        data = {
            key: value
            for key, value in validated_data.items()
            if key not in ("password1", "password2")
        }
        data["password"] = validated_data["password1"]
        return self.Meta.model.objects.create_user(**data)

    class Meta:
        model = get_user_model()
        fields = (
            "id",
            "username",
            "email",
            "password1",
            "password2",
            "first_name",
            "last_name",
            "group",
        )
        read_only_fields = ("id", "group")


# Created a LogInSerializer that serializes the User object and adds the data to the token payload as private claims.
class LogInSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(
        cls, user
    ):  # Avoid overwriting the id claim, since the token already includes it by default. Refer back to the USER_ID_CLAIM setting.
        token = super().get_token(user)
        user_data = UserSerializer(user).data
        for key, value in user_data.items():
            if key != "id":
                token[key] = value
        return token


class RegistrationSerializer(serializers.ModelSerializer):
    # For CurrentUserDefault() to work, I need to send the request context from the view
    # CurrentUserDefault() workss just for validation - most specifically for unique together
    # The logged in user is then added in the create() method
    user = UserSerializer(read_only=True, default=serializers.CurrentUserDefault())

    def validate(self, data):
        # Tournament status validation
        if data["tournament"].status == "COMPLETED":
            raise ValidationError(
                "Registration can't be creted or modified for completed tournament"
            )

        # Forbid the editing of the initially set tournament
        if self.instance and self.instance.tournament.id != data["tournament"].id:
            raise ValidationError(
                "You can't change the tournament of the registration "
            )

        # Cant cancel registration when tournament is consoldiated
        if (
            self.context["request"].method == "PUT"
            and data["tournament"].status == "CONSOLIDATED"
        ):
            raise serializers.ValidationError(
                "Registration cant be cancelled on consolidated tournament"
            )

        return data

    def create(self, validated_data):
        # Add logged in user to the user field
        if "user" not in validated_data:
            validated_data["user"] = self.context["request"].user

        # Check if cancelled registration already exists for the user and tournament,
        # yes -> then delete the existing one and create a new one
        # From UniqueTogethetValidator the CANCELLED statuses needs to be excluded
        cancelled_reg = Registration.objects.filter(
            tournament=validated_data["tournament"].id,
            status="CANCELLED",
            user=validated_data["user"].id,
        )
        # print(cancelled_reg)
        if cancelled_reg.exists():
            registration = cancelled_reg[0]
            registration.delete()

        # if tournament capacity is filled, set status to 'INTERESTED'. Evaluate just with status 'REGISTERED'
        registrations = Registration.objects.filter(
            tournament=validated_data["tournament"].id
        ).filter(status="REGISTERED")

        if registrations.count() >= validated_data["tournament"].capacity:
            validated_data["status"] = "INTERESTED"

        return super(RegistrationSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        # PUT request is used to set status as CANCELLED
        if instance.status == "CANCELLED":
            return instance  # here maybe I could raise an error
        instance.status = "CANCELLED"
        instance.save()

        # Fill the free capacity on the tournament
        fill_torunament(instance.tournament)

        return instance

    class Meta:
        model = Registration
        fields = "__all__"
        read_only_fields = ("id", "registered_on", "cancelled_on", "status")
        validators = [
            UniqueTogetherValidator(
                queryset=Registration.objects.exclude(status="CANCELLED"),
                fields=[
                    "user",
                    "tournament",
                ],
            )
        ]


class Tournamentserializer(serializers.ModelSerializer):

    registrations = RegistrationSerializer(
        read_only=True,
        many=True,
    )

    class Meta:
        model = Tournaments
        fields = "__all__"
        read_only_fields = (
            "id",
            "created",
            "updated",
            "registrations",
        )


class RegistrationSerializerForUser(serializers.ModelSerializer):
    """Get all the registrations for the logged in user"""

    class Meta:
        model = Registration
        fields = ("id", "tournament", "status")
        read_only_fields = ("id", "tournament", "status")
        depth = 1


class WriteSetStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = SetStat
        fields = "__all__"

    def validate(self, data):
        # Validate tennis scores
        score1 = data["score_p1"]
        score2 = data["score_p2"]
        if score1 < score2:
            if 0 <= score1 <= 4 and score2 != 6:
                raise serializers.ValidationError("Invalid score - validation 1")
            if 5 <= score1 <= 6 and score2 != 7:
                raise serializers.ValidationError("Invalid score - validation 2")

        if score1 > score2:
            if 0 <= score2 <= 4 and score1 != 6:
                raise serializers.ValidationError("Invalid score - validation 3")
            if 5 <= score2 <= 6 and score1 != 7:
                raise serializers.ValidationError("Invalid score - validation 4")
        if score1 == score2:
            raise serializers.ValidationError("Invalid score - validation 5")

        # Validate p1 and p2 are different
        if data["player_1"] == data["player_2"]:
            raise serializers.ValidationError("Player 1 cant be same as player 2")

        # Set default value if the given keys are not sent
        data["group"] = data.get("group")
        data["draw_match"] = data.get("draw_match")
        # Group or draw field has to be set
        # if "group" not in data and "draw_match" not in data:
        if (not data["group"]) and (not data["draw_match"]):
            raise serializers.ValidationError(
                "One of 'group' or 'draw_match' fileds needs to be set"
            )

        # Group or draw needs to be from the defined tournament
        if data["group"]:
            if data["group"].tournament.id != data["tournament"].id:
                raise serializers.ValidationError(
                    "Selected group needs to be from the same tournament as the Set"
                )
        if data["draw_match"]:
            if data["draw_match"].draw.tournament.id != data["tournament"].id:
                raise serializers.ValidationError(
                    "Selected draw match needs to be from the same tournament as the Set"
                )

        # Players needs to be from the given tournament
        registration_p1 = Registration.objects.filter(
            tournament=data["tournament"], user=data["player_1"], status="REGISTERED"
        )
        registration_p2 = Registration.objects.filter(
            tournament=data["tournament"], user=data["player_2"], status="REGISTERED"
        )
        if not registration_p1:
            raise serializers.ValidationError(
                f"Player_1 -{data['player_1'].username}- needs to be registered for the given tournament"
            )
        if not registration_p2:
            raise serializers.ValidationError(
                f"Player_2 -{data['player_2'].username}- needs to be registered for the given tournament"
            )

        # Just players from the defined group can be added
        if data["group"]:
            if data["player_1"] not in data["group"].players.all():
                raise serializers.ValidationError(
                    f"Player_1 -{data['player_1'].username}- needs to be in the given group"
                )
            if data["player_2"] not in data["group"].players.all():
                raise serializers.ValidationError(
                    f"Player_2 -{data['player_2'].username}- needs to be in the given group"
                )

        #  In groups each set should be unique - players combination just once
        if data["group"]:
            for set_stat in data["group"].set_stats.all():
                if (
                    data["player_1"] == set_stat.player_1
                    and data["player_2"] == set_stat.player_2
                ) or (
                    data["player_1"] == set_stat.player_2
                    and data["player_2"] == set_stat.player_1
                ):
                    raise serializers.ValidationError(
                        "This set already exists in this group"
                    )

        #  In draw matches each round should contain an unique combination of matches
        if data["draw_match"]:
            players_in_round = []
            for match in data["draw_match"].draw.matches.filter(
                round_of=data["draw_match"].round_of
            ):

                if hasattr(match, "set_stat"):
                    players_in_round.append(match.set_stat.player_1)
                    players_in_round.append(match.set_stat.player_2)

            if data["player_1"] in players_in_round:
                raise serializers.ValidationError(
                    f"Player_1 -{data['player_1'].username}- is already seeded in this round of the draw"
                )
            if data["player_2"] in players_in_round:
                raise serializers.ValidationError(
                    f"Player_2 -{data['player_2'].username}- is already seeded in this round of the draw"
                )

            # Competitors in the set should match the draw match players
            if data["draw_match"].players.all():
                if (
                    data["player_1"] not in data["draw_match"].players.all()
                    or data["player_2"] not in data["draw_match"].players.all()
                ):
                    raise serializers.ValidationError(
                        f"Draw match already contains different players"
                    )

        return data

    def create(self, validated_data):
        match = validated_data["draw_match"]
        if match and not match.players.all():
            match.players.add(validated_data["player_1"])
            match.players.add(validated_data["player_2"])

        # if validated_data["group"]:
        #     manage_group_scores(validated_data, GroupScores)

        return super(WriteSetStatSerializer, self).create(validated_data)

    # def to_representation(self, instance):
    #     representation = super().to_representation(instance)
    #     representation["Player 1 name"] = instance.player_1.first_name
    #     return representation


class ReadSetStatSerializer(serializers.ModelSerializer):
    player_1 = UserSerializer(read_only=True)
    player_2 = UserSerializer(read_only=True)

    class Meta:
        model = SetStat
        fields = "__all__"


class GroupScoresSerializer(serializers.ModelSerializer):
    player = UserSerializer(read_only=True)

    class Meta:
        model = GroupScores
        fields = ("id", "player", "sets_won", "games", "position")
        read_only_fields = ("id",)


class TournamentGroupListSerializer(serializers.ModelSerializer):
    set_stats = ReadSetStatSerializer(many=True)
    players = UserSerializer(many=True, read_only=True)
    scores = GroupScoresSerializer(many=True, read_only=True)

    class Meta:
        model = TournamentGroup
        fields = ("id", "name", "players", "tournament", "set_stats", "scores")
        read_only_fields = ("id",)


class TournamentGroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentGroup
        fields = ("name", "players", "tournament")

    def validate(self, data):
        # Tournament needs to be consolidated to add groups
        if not data["tournament"].status == "CONSOLIDATED":
            raise serializers.ValidationError(
                "Tournament needs to be consolidated to add groups"
            )

        # Players number in group can be 3, 4 or 5
        # if not (3 <= len(data["players"]) <= 5):
        #     raise serializers.ValidationError(
        #         "There should be 3,4 or 5 players in the group"
        #     )

        # Players in group should be from the registered tournament players
        for player in data["players"]:
            if not Registration.objects.filter(
                tournament=data["tournament"], user=player, status="REGISTERED"
            ):
                raise serializers.ValidationError(
                    f"{player.username} is not registered for this tournament"
                )
            print(player.id)
        return data

    def validate_players(self, value):
        # Players number in group can be 3, 4 or 5
        if not (3 <= len(value) <= 5):
            raise serializers.ValidationError(
                "There should be 3,4 or 5 players in the group"
            )
        return value


# class SetStatForEliminationDrawMatchField(serializers.PrimaryKeyRelatedField):
#     def get_queryset(self):
#         # user = self.context["request"].user
#         print(self.context["request"].data)
#         queryset = SetStat.objects.filter(
#             tournament=1
#         )  # couldnt resolve to get the tournament ID - but its not important for the final product
#            # it would be used in the Browsable API
#         return queryset


class EliminationDrawMatchSerializer(serializers.ModelSerializer):
    set_stat = ReadSetStatSerializer(read_only=True)
    players = UserSerializer(many=True, read_only=True)

    class Meta:
        model = EliminationDrawMatch
        fields = ("id", "players", "round_of", "match", "draw", "set_stat")
        read_only_fields = ("id", "round_of", "match", "draw")


class EliminationDrawSerializer(serializers.ModelSerializer):
    matches = EliminationDrawMatchSerializer(many=True, read_only=True)

    class Meta:
        model = EliminationDraw
        fields = ("id", "size", "type_of", "tournament", "players", "matches")
        read_only_fields = ("id", "matches")
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=model.objects.all(),
                fields=("tournament", "type_of"),
            )
        ]

    def validate(self, data):
        # Draw can be created just for CONSOLIDATED tournament
        if data["tournament"].status != "CONSOLIDATED":
            raise serializers.ValidationError(
                "Tournament status needs to be CONSOLIDATED"
            )

        # Number of players cant be more then the size of draw
        if len(data["players"]) > data["size"]:
            raise serializers.ValidationError(
                "Number of players cant be more then the draw size"
            )

        # Added players needs to be registered for the tournament
        for player in data["players"]:
            registration = Registration.objects.filter(
                tournament=data["tournament"], status="REGISTERED", user=player
            )
            if not registration:
                raise serializers.ValidationError(
                    "User needs to be registered for the torunament"
                )

        return data
