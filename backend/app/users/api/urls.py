from django.urls import path
from .views import UserSearchView, FollowView

urlpatterns = [
    # Buscar usuários
    path("users/search/", UserSearchView.as_view(), name="users-search"),

    # Seguir / deixar de seguir
    path("follow/<int:user_id>/", FollowView.as_view(), name="follow-toggle"),
]
