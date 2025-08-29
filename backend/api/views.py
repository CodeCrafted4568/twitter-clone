from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User

from .models import Tweet, Like, Follow
from .serializers import TweetSerializer, UserSerializer, RegisterSerializer
from .permissions import IsOwnerOrReadOnly

class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = s.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class TweetViewSet(viewsets.ModelViewSet):
    queryset = Tweet.objects.select_related('user').all()
    serializer_class = TweetSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update({'request': self.request})
        return ctx

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            return []
        return super().get_permissions()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        t = self.get_object()
        Like.objects.get_or_create(user=request.user, tweet=t)
        return Response({'status':'liked'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unlike(self, request, pk=None):
        t = self.get_object()
        Like.objects.filter(user=request.user, tweet=t).delete()
        return Response({'status':'unliked'})

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request, pk=None):
        target = self.get_object()
        if request.user == target:
            return Response({'detail':'Você não pode seguir a si mesmo.'}, status=400)
        Follow.objects.get_or_create(follower=request.user, following=target)
        return Response({'status':'following'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unfollow(self, request, pk=None):
        target = self.get_object()
        Follow.objects.filter(follower=request.user, following=target).delete()
        return Response({'status':'unfollowed'})
