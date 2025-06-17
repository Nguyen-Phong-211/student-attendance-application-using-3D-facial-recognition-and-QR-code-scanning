from rest_framework import generics, permissions
from .models import Notification
from .serializers import NotificationSerializer

class UserNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(created_by=self.request.user).order_by('-created_at')
