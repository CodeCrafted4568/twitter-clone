from django.contrib.auth import get_user_model
from django.db.models import Count
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
        qs = User.objects.all().annotate(
            followers_count=Count("followers"),
            following_count=Count("following"),
        )
        if q:
            qs = qs.filter(username__icontains=q)
        # opcional: não listar o próprio usuário
        return qs.exclude(id=self.request.user.id)[:20]

class FollowView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        target = generics.get_object_or_404(User, id=user_id)
        if target == request.user:
            return Response({"detail": "Não é possível seguir a si mesmo."}, status=400)
        Follow.objects.get_or_create(follower=request.user, following=target)
        return Response({"is_following": True})

    def delete(self, request, user_id):
        target = generics.get_object_or_404(User, id=user_id)
        Follow.objects.filter(follower=request.user, following=target).delete()
        return Response({"is_following": False})
