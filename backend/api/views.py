from django.db.models import Count
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.filters import SearchFilter

from .models import Tweet, Like, Follow, Comment
from .serializers import (
    TweetSerializer,
    UserSerializer,
    RegisterSerializer,
    UserSerializer,
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
    """
    Lista/detalhe de usuários + follow/unfollow + listas (following/followers).
    Suporta busca: GET /api/users/?search=<termo>
    """
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ["username"]  # /users/?search=tiago

    # ---- follow/unfollow na MESMA rota ----
    @action(detail=True, methods=["post", "delete"], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, pk=None):
        target = self.get_object()
        if request.method == "POST":
            if request.user == target:
                return Response({"detail": "Você não pode seguir a si mesmo."}, status=400)
            Follow.objects.get_or_create(follower=request.user, following=target)
            return Response({"status": "following"}, status=status.HTTP_204_NO_CONTENT)
        # DELETE
        Follow.objects.filter(follower=request.user, following=target).delete()
        return Response({"status": "unfollowed"}, status=status.HTTP_204_NO_CONTENT)

    # ---- compatibilidade com clientes antigos (opcional) ----
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def unfollow(self, request, pk=None):
        target = self.get_object()
        Follow.objects.filter(follower=request.user, following=target).delete()
        return Response({"status": "unfollowed"}, status=status.HTTP_204_NO_CONTENT)

    # ---- listas: who I follow / who follows me ----
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def following(self, request):
        ids = Follow.objects.filter(follower=request.user).values_list("following_id", flat=True)
        qs = User.objects.filter(id__in=list(ids)).order_by("username")
        page = self.paginate_queryset(qs)
        ser = UserSerializer(page or qs, many=True, context={"request": request})
        return self.get_paginated_response(ser.data) if page is not None else Response(ser.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def followers(self, request):
        ids = Follow.objects.filter(following=request.user).values_list("follower_id", flat=True)
        qs = User.objects.filter(id__in=list(ids)).order_by("username")
        page = self.paginate_queryset(qs)
        ser = UserSerializer(page or qs, many=True, context={"request": request})
        return self.get_paginated_response(ser.data) if page is not None else Response(ser.data)


# =============================
# Perfil do usuário logado
# =============================
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        user = request.user
        data = request.data
        changed = False
        errs = {}

        # username
        username = (data.get("username") or "").strip()
        if username and username != user.username:
            if User.objects.filter(username=username).exclude(pk=user.pk).exists():
                errs["username"] = ["Já está em uso."]
            else:
                user.username = username
                changed = True

        # password
        password = data.get("password")
        if password:
            user.set_password(password)
            changed = True

        # avatar (User.avatar ou Profile.avatar — cobre os dois casos)
        avatar = data.get("avatar")
        if avatar:
            if hasattr(user, "avatar"):              # se o campo está no User
                user.avatar = avatar
                changed = True
            elif hasattr(user, "profile") and hasattr(user.profile, "avatar"):  # se tem Profile
                user.profile.avatar = avatar
                user.profile.save()
                changed = True

        if errs:
            return Response(errs, status=status.HTTP_400_BAD_REQUEST)
        if changed:
            user.save()

        return Response(UserSerializer(user, context={"request": request}).data, status=status.HTTP_200_OK)


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
