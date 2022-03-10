from django.http import HttpResponse
from django.shortcuts import render

def index(request):
    user = request.user
    if not user.is_authenticated:
        user = "Stranger"
    context = { "page_title":"The R Blog", "user":user}
    return render(request, "home.html", context)