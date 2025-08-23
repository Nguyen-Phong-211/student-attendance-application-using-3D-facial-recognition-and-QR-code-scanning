import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from jwt import decode as jwt_decode, InvalidTokenError
from django.conf import settings
from channels.db import database_sync_to_async

Account = get_user_model()

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = await self.get_user_from_token()
        if self.user:  # chỉ cần check tồn tại
            self.group_name = f"user_{self.user.account_id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        # event["content"] sẽ là dict bạn gửi từ views hoặc signal
        await self.send_json(event["content"])

    @database_sync_to_async
    def get_user_from_token(self):
        query = self.scope["query_string"].decode()
        params = dict(param.split("=") for param in query.split("&") if "=" in param)
        token = params.get("token")
        if not token:
            return None
        try:
            payload = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
            if not user_id:
                return None
            return Account.objects.get(account_id=user_id)
        except (InvalidTokenError, Account.DoesNotExist, ValueError):
            return None