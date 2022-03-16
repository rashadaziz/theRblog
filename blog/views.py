from .models import Blog, Comment
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
    if request.session.get("originurl"):
        del request.session["originurl"]
    try:
        user = User.objects.get(username=author)
        blog = Blog.objects.get(author=user, blog_id=id)
        comments = Comment.objects.filter(part_of=blog)

        return render(request,"blog_read.html", context={"blog": blog, "comments": comments})
    except:
        raise Http404("Blog Not Found")

@csrf_exempt
def post_comment(request, blog_author, blog_id):
    if request.method == "POST":
        user = request.user
        author_of_blog = User.objects.get(username=blog_author)
        part_of = Blog.objects.get(author=author_of_blog, blog_id=blog_id)
        comments = Comment.objects.filter(author=user)
        comment_id = comments.count() + 1
        content = json.loads(request.body)["content"]

        comment = Comment(
            comment_id=comment_id,
            part_of=part_of,
            author=user,
            content=content
        )
        comment.save()

        return JsonResponse({"success": True})

    return JsonResponse({"success": False})


def get_comments(request, blog_author, blog_id):
    author = User.objects.get(username=blog_author)
    comments = Comment.objects.filter(part_of=Blog.objects.get(author=author, blog_id=blog_id))
    data = {"user_requesting": request.user.username, "comments": []}
    
    for comment in comments:
        comment_data = {}
        comment_data["comment_id"] = comment.comment_id
        comment_data["author"] = comment.author.username
        comment_data["posted_on"] = comment.posted_on
        comment_data["content"] = comment.content
        comment_data["part_of"] = [ comment.part_of.blog_id, comment.part_of.author.username] 
        data["comments"].append(comment_data)

    
    return JsonResponse(data)


def authenticate_user(request, author, blog_id):
    originurl = f"/blog/read/{author}/{blog_id}/" 
    request.session["originurl"] = originurl
    return redirect("login")

@csrf_exempt
def edit_comment(request, comment_id, comment_author, blog_id, blog_author):
    try:
        author = User.objects.get(username=comment_author)
        if request.user == author:
            author_blog = User.objects.get(username=blog_author)
            part_of = Blog.objects.get(blog_id=blog_id, author=author_blog)
            comment = Comment.objects.get(comment_id=comment_id, author=author, part_of=part_of)
            
            comment.content = json.loads(request.body)["content"]
            comment.save()
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"success": False})
        
    except:
        return JsonResponse({"success": False})


@csrf_exempt
def remove_comment(request, comment_id, comment_author, blog_id, blog_author):
    try:
        author = User.objects.get(username=comment_author)
        author_blog = User.objects.get(username=blog_author)
        part_of = Blog.objects.get(blog_id=blog_id, author=author_blog)
        comment = Comment.objects.get(comment_id=comment_id, author=author, part_of=part_of)

        comment.delete()

        return JsonResponse({"success": True})
    except:
        return JsonResponse({"success": False})
