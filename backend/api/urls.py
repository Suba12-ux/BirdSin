from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import (
    UserViewSet, MessageViewSet
)


router = DefaultRouter()
router.register('users', UserViewSet, basename='users')
router.register('messages', MessageViewSet, basename='messages')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('djoser.urls.authtoken')),
]
