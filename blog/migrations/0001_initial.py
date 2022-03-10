# Generated by Django 3.2.7 on 2022-03-10 13:18

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Blog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('blog_id', models.IntegerField()),
                ('published_on', models.DateField(auto_now_add=True)),
                ('last_edited_on', models.DateField(auto_now=True)),
                ('content', models.TextField()),
                ('author', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment_id', models.IntegerField()),
                ('posted_on', models.DateField(auto_now_add=True)),
                ('content', models.TextField()),
                ('author', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('part_of', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='blog.blog')),
                ('replying_to', models.ForeignKey(default=None, on_delete=django.db.models.deletion.SET_DEFAULT, to='blog.comment')),
            ],
        ),
    ]
