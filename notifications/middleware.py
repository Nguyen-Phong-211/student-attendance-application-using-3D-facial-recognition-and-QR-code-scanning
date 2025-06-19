import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

def get_user_model_dynamic():
    return get_user_model()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode()
        params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
        token = params.get('token')
        print("Token: ", token)

        scope['user'] = AnonymousUser()
        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user = await self.get_user(payload.get('user_id'))
                scope['user'] = user
            except Exception:
                pass

        return await self.inner(scope, receive, send)

    @staticmethod
    @database_sync_to_async
    def get_user(user_id):
        User = get_user_model_dynamic()
        try:
            return User.objects.get(account_id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()