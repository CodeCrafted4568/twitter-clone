from django.contrib.auth import get_user_model
from rest_framework import serializers
from ..models import Follow

User = get_user_model()

class SimpleUserSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    is_following = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "avatar_url", "followers_count", "following_count", "is_following"]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        url = None
        if hasattr(obj, "avatar") and getattr(obj, "avatar"):
            url = obj.avatar.url
        elif hasattr(obj, "profile") and getattr(obj.profile, "avatar", None):
            url = obj.profile.avatar.url
        if url and request:
            return request.build_absolute_uri(url)
        return url or ""

    def get_is_following(self, obj):
        req = self.context.get("request")
        if not req or not req.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=req.user, following=obj).exists()

