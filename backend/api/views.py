from django.db.models import Count
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Tweet, Like, Follow, Comment
from .serializers import (
    TweetSerializer,
    UserSerializer,
    RegisterSerializer,
    UserMeSerializer,
    CommentSerializer,
)
from .permissions import IsOwnerOrReadOnly

User = get_user_model()


# =============================
# Feed (apenas de seguidos)
# =============================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def feed_view(request):
    """Retorna tweets apenas dos usuários que eu sigo"""
    user = request.user
    following_ids = user.following.values_list("following_id", flat=True)
    qs = Tweet.objects.filter(user_id__in=following_ids).select_related("user").order_by("-created_at")
    data = TweetSerializer(qs, many=True, context={"request": request}).data
    return Response(data)


# =============================
# Registro de usuários
# =============================
class RegisterView(APIView):
    """Cadastro simples (sem auth)."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = s.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


# =============================
# Tweets (CRUD, curtidas, comentários)
# =============================
class TweetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = TweetSerializer

    def get_queryset(self):
        return (
            Tweet.objects.select_related("user")
            .annotate(
                likes_count=Count("like", distinct=True),
                comments_count=Count("comments", distinct=True),
            )
            .order_by("-created_at")
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update({"request": self.request})
        return ctx

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return []
        return super().get_permissions()

    @action(detail=True, methods=["post", "delete"], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        t = self.get_object()
        if request.method == "POST":
            Like.objects.get_or_create(user=request.user, tweet=t)
            return Response({"status": "liked"})
        Like.objects.filter(user=request.user, tweet=t).delete()
        return Response({"status": "unliked"})

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated])
    def comments(self, request, pk=None):
        t = self.get_object()
        if request.method == "GET":
            qs = t.comments.select_related("user").all()
            return Response(CommentSerializer(qs, many=True).data)
        ser = CommentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        c = Comment.objects.create(
            user=request.user, tweet=t, text=ser.validated_data["text"]
        )
        return Response(CommentSerializer(c).data, status=201)


# =============================
# Usuários (listar, follow/unfollow)
# =============================
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Lista e detalhe de usuários; follow/unfollow como actions."""
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def follow(self, request, pk=None):
        target = self.get_object()
        if request.user == target:
            return Response({"detail": "Você não pode seguir a si mesmo."}, status=400)
        Follow.objects.get_or_create(follower=request.user, following=target)
        return Response({"status": "following"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def unfollow(self, request, pk=None):
        target = self.get_object()
        Follow.objects.filter(follower=request.user, following=target).delete()
        return Response({"status": "unfollowed"})


# =============================
# Perfil do usuário logado
# =============================
class CurrentUserView(APIView):
    """
    /api/users/me/
    GET: retorna { id, username, avatar_url }
    PUT/PATCH multipart: aceita username, password e avatar
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        ser = UserMeSerializer(request.user, context={"request": request})
        return Response(ser.data)

    def put(self, request):
        ser = UserMeSerializer(
            request.user,
            data=request.data,
            context={"request": request},
            partial=True,
        )
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def patch(self, request):
        return self.put(request)


# =============================
# Listas de seguindo/seguidores
# =============================
class FollowingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = User.objects.filter(followers__follower=request.user).order_by("username")
        data = [{"id": u.id, "username": u.username} for u in qs]
        return Response(data)


class FollowersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = User.objects.filter(following__following=request.user).order_by("username")
        data = [{"id": u.id, "username": u.username} for u in qs]
        return Response(data)
