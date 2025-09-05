from django.urls import path, include
from rest_framework.routers import DefaultRouter
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
    path("users/me/", CurrentUserView.as_view(), name="current-user"),

    path("users/following/", FollowingListView.as_view(), name="user-following"),
    path("users/followers/", FollowersListView.as_view(), name="user-followers"),

    path("feed/", feed_view, name="feed"),
    
    path("", include(router.urls)),
]
