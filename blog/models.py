from django.db import models

# primary key will be (id, author)
class Blog(models.Model):
    blog_id = models.IntegerField()
    author = models.ForeignKey('user.User', on_delete=models.CASCADE, default=None)
    published_on = models.DateField(auto_now_add=True)
    last_edited_on = models.DateField(auto_now=True)
    content = models.TextField() # this will store html code

# primary key will be (id, part_of, author)
class Comment(models.Model):
    comment_id = models.IntegerField()
    part_of = models.ForeignKey('blog.Blog', on_delete=models.CASCADE, default=None)
    author = models.ForeignKey('user.User', on_delete=models.CASCADE, default=None)
    posted_on = models.DateField(auto_now_add=True)
    replying_to = models.ForeignKey('self', default=None, on_delete=models.SET_DEFAULT)
    content = models.TextField() # this will just store text (no plans for special format comments) 