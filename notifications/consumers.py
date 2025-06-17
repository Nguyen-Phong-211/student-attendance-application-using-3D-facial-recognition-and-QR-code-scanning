import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth import get_user_model
from jwt import decode as jwt_decode
from django.conf import settings
from channels.db import database_sync_to_async

Account = get_user_model()

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = await self.get_user_from_token()
        if self.user and self.user.is_authenticated:
            self.group_name = f"user_{self.user.account_id}" # self.group_name = f"user_{self.user.pk}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        await self.send_json(event["content"])

    @database_sync_to_async
    def get_user_from_token(self):
        try:
            token = self.scope['query_string'].decode().split('=')[1]
            decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_data.get("user_id")
            return Account.objects.get(pk=user_id)
        except Exception:
            return None