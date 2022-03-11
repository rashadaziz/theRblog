from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from django.shortcuts import render
import requests, json

ACCESS_KEY = "OC9G3k0RI7v8G8BvubdGnkuZi_0wgdHg43iMerFOwQc"

def image_api(request, query):
    response = requests.get(f"https://api.unsplash.com/search/photos/?query={query}&per_page=100&client_id={ACCESS_KEY}")
    serialized = response.json()
    return JsonResponse(serialized)

def create_blog(request):
    if request.user.is_authenticated and request.user.is_staff:
        return render(request, "blog_creator.html")
    
    return HttpResponseForbidden()


