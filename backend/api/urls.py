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

router = DefaultRouter()
router.register(r"tweets", TweetViewSet, basename="tweet")
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    # Registro
    path("register/", RegisterView.as_view(), name="register"),

    # JWT Auth
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Usuário logado e relacionamentos
    path("users/me/", CurrentUserView.as_view(), name="current-user"),
    path("users/following/", FollowingListView.as_view(), name="user-following"),
    path("users/followers/", FollowersListView.as_view(), name="user-followers"),

    # Feed
    path("feed/", feed_view, name="feed"),

    # Endpoints REST padrão (tweets/users)
    path("", include(router.urls)),
]
