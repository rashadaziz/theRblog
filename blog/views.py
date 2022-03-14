from .models import Blog
from user.models import User
from django.http import Http404, HttpResponse, HttpResponseForbidden, HttpResponseNotFound, JsonResponse
from django.shortcuts import redirect, render
import requests, json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.admin.views.decorators import staff_member_required

ACCESS_KEY = "OC9G3k0RI7v8G8BvubdGnkuZi_0wgdHg43iMerFOwQc"

def image_api(request, query):
    response = requests.get(f"https://api.unsplash.com/search/photos/?query={query}&per_page=100&client_id={ACCESS_KEY}")
    serialized = response.json()
    return JsonResponse(serialized)

def create_blog(request):
    if request.user.is_authenticated and request.user.is_staff:
        return render(request, "blog_creator.html")
    
    return HttpResponseForbidden()

@csrf_exempt 
@staff_member_required
def save_blog(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user = request.user
        all_blogs = user.blog_set.all()
        next_id = all_blogs.count() + 1
        blog = Blog(
            blog_id=next_id, 
            author=user, 
            title=data["title"], 
            thumbnail=data["thumbnail"],
            content=data["content"]
            )
        blog.save()
        return JsonResponse({"success": True})
    
    raise Http404("Not Found")

def view_blogs(request):
    return render(request, "blog_explore.html")

def get_blogs(request):
    context = {"blogs":[]}
    all_blogs = Blog.objects.all()
    for blog in all_blogs:
        arr = context["blogs"]
        data = {}
        data["id"] = blog.blog_id
        data["title"] = blog.title
        data["thumbnail"] = blog.thumbnail
        data["author"] = blog.author.username
        data["published_on"] = str(blog.published_on)
        data["content"] = blog.content
        arr.append(data)

    return JsonResponse(context)

def view_blog(request, author, id):
    pass