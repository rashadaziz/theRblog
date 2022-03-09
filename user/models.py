from django.db import models
from django.contrib.auth.models import AbstractBaseUser

# Create your models here.
class User(AbstractBaseUser):
    username = models.CharField(max_length=255, primary_key=True)
    is_owner = models.BooleanField(default=False)
    full_name = models.CharField(max_length=255)
    USERNAME_FIELD = 'username'
