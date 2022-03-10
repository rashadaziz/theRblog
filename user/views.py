from django.db import IntegrityError
from django.contrib.auth import login, authenticate
from django.shortcuts import redirect, render
from .models import User

def register(request):
    context = {}

    if request.method == "POST":
        username = request.POST["username"]
        full_name = request.POST["full_name"]
        password = request.POST["password"]
        remember_me = request.POST.get("remember_me")
        user = User(username=username, full_name=full_name)
        user.set_password(password)

        try:
            user.save(force_insert=True)
            request.session.clear()
            if not remember_me:
                request.session.set_expiry(0)
            login(request, user)
            return redirect("home")
        
        except IntegrityError: 
            context["duplicate_email"] = True

    return render(request, "register.html", context)