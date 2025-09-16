from django.urls import path
from .views import UserSearchView, FollowView

urlpatterns = [
    path("users/search/", UserSearchView.as_view(), name="users-search"),
    path("follow/<int:user_id>/", FollowView.as_view(), name="follow-toggle"),
]
