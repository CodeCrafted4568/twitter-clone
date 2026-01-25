from django.contrib import admin
from .models import Profile, Tweet, Like, Comment

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "avatar")

admin.site.register(Tweet)
admin.site.register(Like)
admin.site.register(Comment)
