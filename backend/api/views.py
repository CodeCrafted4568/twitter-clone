from django.db.models import Count
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.filters import SearchFilter
from django.contrib.auth.models import User

from .models import Tweet, Like, Comment
from app.users.models import Follow
from .serializers import (
    TweetSerializer,
    PublicUserSerializer,
    UserMeSerializer,
    RegisterSerializer,
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
    """Retorna tweets apenas dos usuários que o usuário autenticado segue."""
    user = request.user
    following_ids = user.following.values_list("following_id", flat=True)
    qs = (
        Tweet.objects.filter(user_id__in=following_ids)
        .select_related("user")
        .order_by("-created_at")
    )
    data = TweetSerializer(qs, many=True, context={"request": request}).data
    return Response(data)


# =============================
# Registro de usuários
# =============================
class RegisterView(APIView):
    """Endpoint para registro de novos usuários (sem autenticação necessária)."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = s.save()
        return Response(PublicUserSerializer(user, context={"request": request}).data, status=status.HTTP_201_CREATED)


# =============================
# Tweets (CRUD, curtidas, comentários)
# =============================
class TweetViewSet(viewsets.ModelViewSet):
    """Gerencia tweets e permite curtidas e comentários."""
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = TweetSerializer

    def get_queryset(self):
        return (
            Tweet.objects.select_related("user")
            .annotate(
                likes_count=Count("likes", distinct=True),
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

        # ✅ Curtir / Descurtir
    @action(detail=True, methods=["post", "delete"], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        tweet = self.get_object()
        user = request.user

        if request.method == "POST":
            Like.objects.get_or_create(user=user, tweet=tweet)
        else:
            Like.objects.filter(user=user, tweet=tweet).delete()

        # Recarrega o Tweet com anotations atualizados
        tweet = Tweet.objects.annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", distinct=True),
        ).get(id=tweet.id)

        serializer = self.get_serializer(tweet)
        return Response(serializer.data, status=status.HTTP_200_OK)


    # ✅ Listar / Adicionar comentários
    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated])
    def comments(self, request, pk=None):
        tweet = self.get_object()

        if request.method == "GET":
            qs = tweet.comments.select_related("user").all()
            ser = CommentSerializer(qs, many=True, context={"request": request})
            return Response(ser.data, status=status.HTTP_200_OK)

        # POST: adiciona comentário
        ser = CommentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        Comment.objects.create(
            user=request.user,
            tweet=tweet,
            text=ser.validated_data["text"],
        )

        # Atualiza contagens após comentar
        tweet.likes_count = tweet.likes.count()
        tweet.comments_count = tweet.comments.count()

        # Atualiza contagens via annotate
        tweet = Tweet.objects.annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", distinct=True),
        ).get(id=tweet.id)

        ser_tweet = self.get_serializer(tweet)
        return Response(ser_tweet.data, status=status.HTTP_201_CREATED)


# =============================
# Usuários (listar, follow/unfollow)
# =============================
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Lista e detalhes de usuários. Permite seguir/deixar de seguir e remover avatar."""
    queryset = User.objects.all().order_by("id")
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ["username"]

    @action(detail=True, methods=["post", "delete"], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, pk=None):
        """Segue ou deixa de seguir um usuário."""
        target = self.get_object()
        user = request.user

        if user == target:
            return Response({"detail": "Você não pode seguir a si mesmo."}, status=status.HTTP_400_BAD_REQUEST)

        if request.method == "POST":
            Follow.objects.get_or_create(follower=user, following=target)
            status_str = "following"
        else:
            Follow.objects.filter(follower=user, following=target).delete()
            status_str = "unfollowed"

        data = {
            "status": status_str,
            "following_count": Follow.objects.filter(follower=user).count(),
            "followers_count": Follow.objects.filter(following=user).count(),
        }
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def following(self, request):
        """Lista de quem o usuário autenticado está seguindo."""
        ids = Follow.objects.filter(follower=request.user).values_list("following_id", flat=True)
        qs = User.objects.filter(id__in=ids).order_by("username")
        page = self.paginate_queryset(qs)
        serializer = PublicUserSerializer(page or qs, many=True, context={"request": request})
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def followers(self, request):
        """Lista de quem segue o usuário autenticado."""
        ids = Follow.objects.filter(following=request.user).values_list("follower_id", flat=True)
        qs = User.objects.filter(id__in=ids).order_by("username")
        page = self.paginate_queryset(qs)
        serializer = PublicUserSerializer(page or qs, many=True, context={"request": request})
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

    @action(detail=False, methods=["delete"], permission_classes=[permissions.IsAuthenticated])
    def remove_profile_image(self, request):
        """Remove o avatar do usuário autenticado."""
        user = request.user

        # Compatível com campo avatar em Profile
        if hasattr(user, "profile") and user.profile.avatar:
            user.profile.avatar.delete(save=True)
            serializer = PublicUserSerializer(user, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({"detail": "Nenhuma imagem para remover."}, status=status.HTTP_400_BAD_REQUEST)




# =============================
# Perfil do usuário logado
# =============================
class CurrentUserView(APIView):
    """Visualiza e atualiza o perfil do usuário autenticado."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        return Response(UserMeSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        user = request.user
        data = request.data
        changed = False
        errs = {}

        username = (data.get("username") or "").strip()
        if username and username != user.username:
            if User.objects.filter(username=username).exclude(pk=user.pk).exists():
                errs["username"] = ["Já está em uso."]
            else:
                user.username = username
                changed = True

        password = data.get("password")
        if password:
            user.set_password(password)
            changed = True

        avatar = data.get("avatar")
        if avatar:
            if hasattr(user, "avatar"):
                user.avatar = avatar
                changed = True
            elif hasattr(user, "profile") and hasattr(user.profile, "avatar"):
                user.profile.avatar = avatar
                user.profile.save()
                changed = True

        if errs:
            return Response(errs, status=status.HTTP_400_BAD_REQUEST)
        if changed:
            user.save()

        return Response(UserMeSerializer(user, context={"request": request}).data, status=status.HTTP_200_OK)


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
