import asyncio

import pytest
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from api.models import Message, User
from bird.asgi import application


async def receive_event(communicator, event_type):
    while True:
        event = await asyncio.wait_for(
            communicator.receive_json_from(), timeout=3
        )
        if event.get('type') == event_type:
            return event


@pytest.mark.django_db(transaction=True)
def test_chat_websocket_delivers_messages_typing_and_read_receipts():
    author = User.objects.create_user(
        username='author',
        email='author@example.com',
        password='test-password',
        first_name='Author',
        last_name='Test',
    )
    recipient = User.objects.create_user(
        username='recipient',
        email='recipient@example.com',
        password='test-password',
        first_name='Recipient',
        last_name='Test',
    )
    author_token = Token.objects.create(user=author)
    recipient_token = Token.objects.create(user=recipient)

    def create_message_via_api():
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION=f'Token {author_token.key}'
        )
        return client.post(
            '/api/messages/',
            {'recipient': recipient.pk, 'text': 'Hello in real time'},
            format='json',
        )

    def get_message_read_status(message_id):
        return Message.objects.values_list(
            'is_read', flat=True
        ).get(pk=message_id)

    async def run_chat():
        author_ws = WebsocketCommunicator(
            application,
            f'/ws/chat/{recipient.pk}/',
            subprotocols=['bird-chat', f'token.{author_token.key}'],
        )
        recipient_ws = WebsocketCommunicator(
            application,
            f'/ws/chat/{author.pk}/',
            subprotocols=['bird-chat', f'token.{recipient_token.key}'],
        )
        author_connected, _ = await author_ws.connect()
        recipient_connected, _ = await recipient_ws.connect()
        assert author_connected and recipient_connected

        response = await database_sync_to_async(create_message_via_api)()
        assert response.status_code == 201
        message_event = await receive_event(recipient_ws, 'message')
        assert message_event['message']['text'] == 'Hello in real time'

        await author_ws.send_json_to({
            'type': 'typing',
            'is_typing': True,
        })
        typing_event = await receive_event(recipient_ws, 'typing')
        assert typing_event['is_typing'] is True

        message_id = message_event['message']['id']
        await recipient_ws.send_json_to({'type': 'read'})
        read_event = await receive_event(author_ws, 'read')
        assert message_id in read_event['message_ids']
        is_read = await database_sync_to_async(get_message_read_status)(
            message_id
        )
        assert is_read is True

        await author_ws.disconnect()
        await recipient_ws.disconnect()

    async_to_sync(run_chat)()
