from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSerializer

User = get_user_model()


class UserSearchView(generics.ListAPIView):
    """
    Endpoint para buscar usuários pelo nome de usuário.
    Exemplo: /api/users/search/?q=tiago
    """
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        if query:
            return User.objects.filter(username__icontains=query)
        return User.objects.none()


class FollowView(APIView):
    """
    Endpoint para seguir ou deixar de seguir um usuário.
    POST /api/follow/<int:user_id>/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target_user = get_object_or_404(User, pk=user_id)
        user = request.user

        if target_user == user:
            return Response(
                {"detail": "Você não pode seguir a si mesmo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # alterna seguir/deixar de seguir
        if target_user.followers.filter(id=user.id).exists():
            target_user.followers.remove(user)
            following = False
            message = "Deixou de seguir."
        else:
            target_user.followers.add(user)
            following = True
            message = "Agora está seguindo."

        # opcional: atualiza contadores
        target_user.save()
        user.save()

        return Response(
            {
                "detail": message,
                "following": following,
                "followers_count": target_user.followers.count(),
                "following_count": user.following.count(),
            },
            status=status.HTTP_200_OK,
        )
