# Generated by Django 3.2.7 on 2022-03-09 12:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='is_owner',
            new_name='is_staff',
        ),
    ]
