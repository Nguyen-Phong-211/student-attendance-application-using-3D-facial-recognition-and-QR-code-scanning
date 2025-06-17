"""
ASGI config for attend3d project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import get_default_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
import attend3d.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attend3d.settings')

django.setup()

from attend3d.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        attend3d.routing.websocket_urlpatterns
    ),
})
# application = get_default_application()
# application = get_asgi_application()
