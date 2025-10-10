from django.contrib.auth import get_user_model
from django.db.models import Count, Exists, OuterRef
from rest_framework import permissions, status, generics, views
from rest_framework.response import Response
from .models import Follow
from .serializers import UserMiniSerializer

User = get_user_model()


class UserSearchView(generics.ListAPIView):
    serializer_class = UserMiniSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        q = self.request.query_params.get("q", "").strip()

        # Anota contadores e se o usuário logado já segue cada um
        qs = (
            User.objects.all()
            .annotate(
                followers_count=Count("followers", distinct=True),
                following_count=Count("following", distinct=True),
                is_following=Exists(
                    Follow.objects.filter(
                        follower=self.request.user,
                        following=OuterRef("pk"),
                    )
                ),
            )
        )

        if q:
            qs = qs.filter(username__icontains=q)

        # Evita listar o próprio usuário
        return qs.exclude(id=self.request.user.id)[:20]


class FollowView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        target = generics.get_object_or_404(User, id=user_id)
        if target == request.user:
            return Response({"detail": "Não é possível seguir a si mesmo."}, status=400)

        Follow.objects.get_or_create(follower=request.user, following=target)

        # Recalcula dados atualizados
        followers_count = Follow.objects.filter(following=target).count()
        following_count = Follow.objects.filter(follower=target).count()
        return Response(
            {
                "followers_count": followers_count,
                "following_count": following_count,
                "is_following": True,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, user_id):
        target = generics.get_object_or_404(User, id=user_id)
        Follow.objects.filter(follower=request.user, following=target).delete()

        # Recalcula dados atualizados
        followers_count = Follow.objects.filter(following=target).count()
        following_count = Follow.objects.filter(follower=target).count()
        return Response(
            {
                "followers_count": followers_count,
                "following_count": following_count,
                "is_following": False,
            },
            status=status.HTTP_200_OK,
        )
