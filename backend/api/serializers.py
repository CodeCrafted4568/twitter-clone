from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Profile, Tweet, Like, Comment

User = get_user_model()


# =============================
# Comentários
# =============================
class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "text", "created_at"]


# =============================
# Tweets
# =============================
class TweetSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    # ↙️ API expõe "text", mas grava em "content"
    text = serializers.CharField(source="content")
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    liked = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = [
            "id",
            "user",
            "text",           # campo exposto no JSON
            "created_at",
            "likes_count",
            "comments_count",
            "liked",
        ]

    def get_liked(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or user.is_anonymous:
            return False
        return Like.objects.filter(user=user, tweet=obj).exists()


# =============================
# Usuários
# =============================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=5)

    class Meta:
        model = User
        fields = ["id", "username", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )


class UserMeSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source="profile.avatar", required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "avatar", "avatar_url"]
        extra_kwargs = {"username": {"required": False}}

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if hasattr(obj, "profile") and obj.profile.avatar:
            url = obj.profile.avatar.url
            return request.build_absolute_uri(url) if request else url
        return None

    def update(self, instance, validated_data):
        # dados aninhados do Profile
        profile_data = validated_data.pop("profile", {})
        username = validated_data.get("username")

        if username:
            instance.username = username

        password = self.context["request"].data.get("password")
        if password:
            instance.set_password(password)

        instance.save()

        # atualiza avatar no Profile
        if profile_data:
            avatar = profile_data.get("avatar", None)
            profile = getattr(instance, "profile", None)
            if profile is None:
                profile = Profile.objects.create(user=instance)
            if avatar is not None:
                profile.avatar = avatar
                profile.save()

        return instance
