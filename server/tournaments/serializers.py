from telnetlib import STATUS
from attr import fields
from django.contrib.auth import get_user_model
from django.forms import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Tournaments, Registration
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
        )
        read_only_fields = ("id",)


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
        return data

    def create(self, validated_data):
        # Add logged in user to the user field
        if "user" not in validated_data:
            validated_data["user"] = self.context["request"].user

        # Check if cancelled registration already exists for the user and tournament,
        # yes -> then delete the existing one and create a new one
        # From UniqueTogethetValidator the CANCELLED statuses needs to be excluded
        cancelled_reg = Registration.objects.filter(
            tournament=validated_data["tournament"].id, status="CANCELLED"
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

    competitors = RegistrationSerializer(
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
            "competitors",
        )
