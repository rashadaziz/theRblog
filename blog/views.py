from .models import Blog
from user.models import User
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from django.shortcuts import redirect, render
import requests, json
from django.views.decorators.csrf import csrf_exempt

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

