"""
ASGI config for attend3d project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

# import os
# import django

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attend3d.settings')
# django.setup()

# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from notifications.middleware import JWTAuthMiddleware 
# from attend3d.routing import websocket_urlpatterns

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": JWTAuthMiddleware(
#         URLRouter(websocket_urlpatterns)
#     ),
# })
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

import notifications.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(notifications.routing.websocket_urlpatterns)
        )
    ),
})
