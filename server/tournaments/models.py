from wsgiref.validate import validator
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import validate_email

# Create your models here.
class User(AbstractUser):
	email = models.EmailField(unique=True, blank=False, max_length=254, verbose_name='email address', validators=[validate_email])
	