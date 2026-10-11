from django.urls import path

from api.consumers import ChatConsumer


websocket_urlpatterns = [
    path('ws/chat/<int:recipient_id>/', ChatConsumer.as_asgi()),
]
