from rest_framework import generics, permissions
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class UserNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(created_by=self.request.user).order_by('-created_at') # , is_read='0'
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_as_read(request):
    ids = request.data.get("notification_id", [])
    Notification.objects.filter(pk__in=ids).update(is_read='1')
    return Response({"status": "success"})
