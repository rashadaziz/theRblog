from django.urls import path
from .views import *

urlpatterns = [
    path("searchimage/<query>/", image_api),
    path("builder/", create_blog),
    path("save/", save_blog)
]