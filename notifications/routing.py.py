from django.urls import re_path
from .consumers import NotificationConsumer

websocket_urlpatterns = [
    # ws://HOST/ws/notifications/<account_id>/
    re_path(r"ws/notifications/(?P<account_id>\d+)/$", NotificationConsumer.as_asgi()),
]