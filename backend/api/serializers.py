from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Profile

User = get_user_model()

class UserMeSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='profile.avatar', required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'avatar_url']
        extra_kwargs = {'username': {'required': False}}

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'profile') and obj.profile.avatar:
            url = obj.profile.avatar.url
            return request.build_absolute_uri(url) if request else url
        return None

    def update(self, instance, validated_data):
        # profile aninhado
        profile_data = validated_data.pop('profile', {})
        username = validated_data.get('username')

        if username:
            instance.username = username

        # password vem do corpo original
        password = self.context['request'].data.get('password')
        if password:
            instance.set_password(password)

        instance.save()

        # avatar no Profile
        if profile_data:
            avatar = profile_data.get('avatar', None)
            profile = getattr(instance, 'profile', None)
            if profile is None:
                profile = Profile.objects.create(user=instance)
            if avatar is not None:
                profile.avatar = avatar
                profile.save()

        return instance
