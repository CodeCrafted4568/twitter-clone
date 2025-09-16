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
    path("register/", RegisterView.as_view(), name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("users/me/", CurrentUserView.as_view(), name="current-user"),

    path("users/following/", FollowingListView.as_view(), name="user-following"),
    path("users/followers/", FollowersListView.as_view(), name="user-followers"),

    path("feed/", feed_view, name="feed"),
    
    path("", include(router.urls)),
]
