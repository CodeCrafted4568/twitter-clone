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
    text = serializers.CharField(source="content")

    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = [
            "id",
            "user",
            "text",
            "image",
            "created_at",
            "likes_count",
            "comments_count",
            "liked",
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_liked(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        user = request.user
        return obj.likes.filter(user=user).exists()


# =============================
# Usuários
# =============================
class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "avatar_url"]

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

        # atualiza username
        if username:
            instance.username = username

        # atualiza senha (vem direto do request, não de validated_data)
        password = self.context["request"].data.get("password")
        if password:
            instance.set_password(password)

        instance.save()

        # atualiza avatar
        if profile_data:
            avatar = profile_data.get("avatar", None)
            profile = getattr(instance, "profile", None)
            if profile is None:
                profile = Profile.objects.create(user=instance)

            # remover avatar
            if avatar == "remove":
                profile.avatar.delete(save=False)
                profile.avatar = None
                profile.save()

            # salvar novo avatar
            elif avatar is not None:
                profile.avatar = avatar
                profile.save()

        return instance

