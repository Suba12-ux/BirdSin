"""
ASGI config for bird project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bird.settings')

django_application = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from api.ws_auth import TokenSubprotocolAuthMiddleware
from api.ws_routing import websocket_urlpatterns


application = ProtocolTypeRouter({
    'http': django_application,
    'websocket': AllowedHostsOriginValidator(
        TokenSubprotocolAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
