from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import (
    UserViewSet, MessageViewSet,
    NewsViewSet, SearchViewSet
)


router = DefaultRouter()
router.register('users', UserViewSet, basename='users')
router.register('messages', MessageViewSet, basename='messages')
router.register('news', NewsViewSet, basename='news')
router.register('search', SearchViewSet, basename='search')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('djoser.urls.authtoken')),
]
