from django.db import models

# primary key will be (id, author)
class Blog(models.Model):
    blog_id = models.IntegerField()
    title = models.TextField(default=None)
    thumbnail = models.TextField(default=None)
    author = models.ForeignKey('user.User', on_delete=models.CASCADE, default=None)
    published_on = models.DateField(auto_now_add=True)
    content = models.TextField() # this will store html code
    class Meta:
        unique_together = ('blog_id', 'author', )

# primary key will be (id, part_of, author)
class Comment(models.Model):
    comment_id = models.IntegerField()
    part_of = models.ForeignKey('blog.Blog', on_delete=models.CASCADE, default=None)
    author = models.ForeignKey('user.User', on_delete=models.CASCADE, default=None)
    posted_on = models.DateField(auto_now_add=True)
    replying_to = models.ForeignKey('self', default=None, on_delete=models.SET_DEFAULT)
    content = models.TextField() # this will just store text (no plans for special format comments)
    class Meta:
        unique_together = ('comment_id', 'part_of', 'author', ) 