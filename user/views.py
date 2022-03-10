from django.db import IntegrityError
from django.contrib.auth import login, logout, authenticate
from django.shortcuts import redirect, render
from .models import User

def register(request):
    context = {}
    if request.method == "POST":
        username = request.POST["username"]
        full_name = request.POST["full_name"]
        password = request.POST["password"]
        user = User(username=username, full_name=full_name)
        user.set_password(password)

        try:
            user.save(force_insert=True)
            request.session.clear()
            login(request, user)
            return redirect("home")
        
        except IntegrityError: 
            context["duplicate_email"] = True

    return render(request, "register.html", context)


def login_view(request):
    context = {}
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        remember_me = request.POST.get("remember_me")
        user = authenticate(request, username=username, password=password)

        if user:
            if not remember_me:
                request.session.set_expiry(0)
            login(request, user)
            return redirect("home")

        else:
            context["login_error"] = True
    
    return render(request, "login.html", context)

def logout_view(request):
    logout(request)
    request.session.flush()
    return redirect("home")
    

