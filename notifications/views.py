from rest_framework import generics, permissions
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# ======================== Display list notifications by account_id ========================
class UserNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        account_id = self.kwargs.get("account_id")
        return Notification.objects.filter(to_target_id=account_id).order_by("-created_at")

# ======================== Filter notifications (not read) by account_id ========================
class UnreadNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        account_id = self.request.user.account_id
        return (
            Notification.objects
            .filter(to_target_id=account_id, is_read='0')
            .order_by('-created_at')
        )
    
# ======================== Mark notifications as read ========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_as_read(request, account_id):
    if account_id != request.user.account_id:
        return Response({"error": "Permission denied"}, status=403)

    ids = request.data.get("notification_id", [])

    Notification.objects.filter(
        pk__in=ids,
        to_target_id=account_id
    ).update(is_read='1')

    return Response({"status": "success"})