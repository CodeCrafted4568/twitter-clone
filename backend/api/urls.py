from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    TweetViewSet,
    UserViewSet,
    CurrentUserView,
    FollowingListView,
    FollowersListView,
    RegisterView,
    feed_view,
)

# router principal para os endpoints REST
router = DefaultRouter()
router.register(r"tweets", TweetViewSet, basename="tweet")
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    # Registro de usuário
    path("register/", RegisterView.as_view(), name="register"),

    # Autenticação (login e refresh)
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Usuário atual
    path("users/me/", CurrentUserView.as_view(), name="current-user"),

    # Seguidores / seguindo
    path("users/following/", FollowingListView.as_view(), name="user-following"),
    path("users/followers/", FollowersListView.as_view(), name="user-followers"),

    # Feed de tweets
    path("feed/", feed_view, name="feed"),

    # Inclui endpoints REST (tweets e users)
    path("", include(router.urls)),

    # Inclui as rotas específicas do app users (follow e search)
    path("", include("app.users.api.urls")),
]
