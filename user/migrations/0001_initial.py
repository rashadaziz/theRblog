# Generated by Django 3.2.7 on 2022-03-09 12:42

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('username', models.CharField(max_length=255, primary_key=True, serialize=False)),
                ('is_owner', models.BooleanField(default=False)),
                ('full_name', models.CharField(max_length=255)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
