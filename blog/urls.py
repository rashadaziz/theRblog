from django.urls import path
from .views import *

urlpatterns = [
    path("searchimage/<query>/", image_api),
    path("builder/", create_blog, name="create"),
    path("save/", save_blog),
    path("get/all/", get_blogs),
    path("explore/", view_blogs, name="explore"),
    path("read/<author>/<id>/", view_blog)
]