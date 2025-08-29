from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import TweetViewSet, UserViewSet, RegisterView

router = DefaultRouter()
router.register(r'tweets', TweetViewSet, basename='tweet')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/token/', TokenObtainPairView.as_view()),
    path('auth/token/refresh/', TokenRefreshView.as_view()),
    path('', include(router.urls)),
]
