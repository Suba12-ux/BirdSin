from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from api.models import Message, User


def conversation_group(user_id, recipient_id):
    first_id, second_id = sorted((int(user_id), int(recipient_id)))
    return f'chat_{first_id}_{second_id}'


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.recipient_id = self.scope['url_route']['kwargs']['recipient_id']
        if not self.user.is_authenticated:
            await self.close(code=4401)
            return
        if self.user.pk == self.recipient_id or not await self.user_exists():
            await self.close(code=4404)
            return

        self.chat_group = conversation_group(
            self.user.pk, self.recipient_id
        )
        self.own_presence_group = f'presence_{self.user.pk}'
        self.peer_presence_group = f'presence_{self.recipient_id}'
        await self.channel_layer.group_add(self.chat_group, self.channel_name)
        await self.channel_layer.group_add(
            self.own_presence_group, self.channel_name
        )
        await self.channel_layer.group_add(
            self.peer_presence_group, self.channel_name
        )
        await self.accept('bird-chat')
        await self.channel_layer.group_send(
            self.own_presence_group,
            {
                'type': 'presence_update',
                'user_id': self.user.pk,
                'is_online': True,
            },
        )
        await self.channel_layer.group_send(
            self.peer_presence_group,
            {
                'type': 'presence_probe',
                'user_id': self.recipient_id,
                'requester_id': self.user.pk,
            },
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'chat_group'):
            await self.channel_layer.group_discard(
                self.chat_group, self.channel_name
            )
            await self.channel_layer.group_discard(
                self.own_presence_group, self.channel_name
            )
            await self.channel_layer.group_discard(
                self.peer_presence_group, self.channel_name
            )
            await self.channel_layer.group_send(
                self.own_presence_group,
                {
                    'type': 'presence_update',
                    'user_id': self.user.pk,
                    'is_online': False,
                },
            )

    async def receive_json(self, content, **kwargs):
        event_type = content.get('type')
        if event_type == 'typing' and isinstance(
            content.get('is_typing'), bool
        ):
            await self.channel_layer.group_send(
                self.chat_group,
                {
                    'type': 'typing_update',
                    'user_id': self.user.pk,
                    'is_typing': content['is_typing'],
                },
            )
        elif event_type == 'read':
            message_ids = await self.mark_messages_read()
            if message_ids:
                await self.channel_layer.group_send(
                    self.chat_group,
                    {
                        'type': 'messages_read',
                        'user_id': self.user.pk,
                        'message_ids': message_ids,
                    },
                )
        elif event_type == 'heartbeat':
            await self.channel_layer.group_send(
                self.own_presence_group,
                {
                    'type': 'presence_update',
                    'user_id': self.user.pk,
                    'is_online': True,
                },
            )

    async def message_created(self, event):
        await self.send_json({
            'type': 'message',
            'message': event['message'],
        })

    async def messages_read(self, event):
        await self.send_json({
            'type': 'read',
            'user_id': event['user_id'],
            'message_ids': event['message_ids'],
        })

    async def typing_update(self, event):
        if event['user_id'] != self.user.pk:
            await self.send_json({
                'type': 'typing',
                'user_id': event['user_id'],
                'is_typing': event['is_typing'],
            })

    async def presence_update(self, event):
        await self.send_json({
            'type': 'presence',
            'user_id': event['user_id'],
            'is_online': event['is_online'],
        })

    async def presence_probe(self, event):
        if event['user_id'] == self.user.pk:
            await self.channel_layer.group_send(
                f"presence_{event['requester_id']}",
                {
                    'type': 'presence_update',
                    'user_id': self.user.pk,
                    'is_online': True,
                },
            )

    @database_sync_to_async
    def user_exists(self):
        return User.objects.filter(pk=self.recipient_id).exists()

    @database_sync_to_async
    def mark_messages_read(self):
        unread = Message.objects.filter(
            author_id=self.recipient_id,
            recipient=self.user,
            is_read=False,
        )
        message_ids = list(unread.values_list('id', flat=True))
        if message_ids:
            unread.update(is_read=True)
        return message_ids
