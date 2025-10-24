from django.urls import path
from .views import UserSearchView, FollowView, UserMeView

urlpatterns = [
    path("search/", UserSearchView.as_view(), name="user-search"),
    path("follow/<int:user_id>/", FollowView.as_view(), name="user-follow"),
    path("me/", UserMeView.as_view(), name="user-me"),
]
