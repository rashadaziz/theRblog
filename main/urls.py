from unicodedata import name
from django.urls import path
from .views import *

urlpatterns = [
    path("", index, name="home"),
    path("about/", about_me, name="about"),
]