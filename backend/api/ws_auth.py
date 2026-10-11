from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async


@database_sync_to_async
def get_user_for_token(key):
    try:
        return Token.objects.select_related('user').get(key=key).user
    except Token.DoesNotExist:
        return AnonymousUser()


class TokenSubprotocolAuthMiddleware:
    """Authenticates browser WebSockets using a negotiated subprotocol."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        scope['user'] = AnonymousUser()

        for protocol in scope.get('subprotocols', []):
            if protocol.startswith('token.'):
                scope['user'] = await get_user_for_token(
                    protocol.removeprefix('token.')
                )
                break

        return await self.app(scope, receive, send)
