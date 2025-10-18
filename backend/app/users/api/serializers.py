from django.contrib.auth import get_user_model
from rest_framework import serializers
from ..models import Follow

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "avatar_url", "followers_count", "following_count", "is_following"]

    def get_is_following(self, obj):
        req = self.context.get("request")
        if not req or not req.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=req.user, following=obj).exists()
