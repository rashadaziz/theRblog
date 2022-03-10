from multiprocessing.sharedctypes import Value
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class MyAccountManager(BaseUserManager):
    def create_user(self, username, password=None):
        if not username:
            raise Value("Users must have a username")
        
        user = self.model(
            username = username
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, password):
        user = self.create_user(
            username=username,
            password=password
        )
        user.is_staff = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    username = models.CharField(max_length=255, primary_key=True)
    full_name = models.CharField(max_length=255)
    is_staff = models.BooleanField(default=False)
    USERNAME_FIELD = 'username'

    objects = MyAccountManager()

    def __str__(self):
        return self.username
    
    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return True