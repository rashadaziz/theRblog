from django.urls import path
from .views import *

urlpatterns = [
    path("searchimage/<query>/", image_api),
    path("builder/", create_blog, name="create"),
    path("save/", save_blog),
    path("get/all/", get_blogs),
    path("explore/", view_blogs, name="explore"),
    path("", view_blogs),
    path("read/<author>/<id>/", view_blog),
    path("comment/post/<blog_author>/<blog_id>/", post_comment),
    path("comment/get/<blog_author>/<blog_id>/", get_comments)
]