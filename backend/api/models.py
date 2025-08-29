from django.db import models
from django.contrib.auth.models import User

class Tweet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tweets')
    content = models.CharField(max_length=280)
    image = models.ImageField(upload_to='tweets/', null=True, blank=True)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.SET_NULL)
    retweet_of = models.ForeignKey('self', null=True, blank=True, related_name='retweets', on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-created_at']

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('follower', 'following')

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'tweet')
