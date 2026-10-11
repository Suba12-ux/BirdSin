import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bird.settings')

django_application = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.security.websocket import (  # noqa: E402
    AllowedHostsOriginValidator,
)

from api.ws_auth import TokenSubprotocolAuthMiddleware  # noqa: E402
from api.ws_routing import websocket_urlpatterns  # noqa: E402


application = ProtocolTypeRouter({
    'http': django_application,
    'websocket': AllowedHostsOriginValidator(
        TokenSubprotocolAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
