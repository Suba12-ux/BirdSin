from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import (
    UserViewSet, MessageViewSet,
    NewsViewSet, SearchViewSet, BotViewSet,
    FeedViewSet
)


router = DefaultRouter()
router.register('users', UserViewSet, basename='users')
router.register('messages', MessageViewSet, basename='messages')
router.register('news', NewsViewSet, basename='news')
router.register('search', SearchViewSet, basename='search')
router.register('bot-news', BotViewSet, basename='bot-news')
router.register('feed', FeedViewSet, basename='feed')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('djoser.urls.authtoken')),
]
