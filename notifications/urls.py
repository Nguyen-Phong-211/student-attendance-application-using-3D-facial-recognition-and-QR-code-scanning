from django.urls import path
from .views import UserNotificationListView, mark_notifications_as_read

urlpatterns = [
    path('notifications/all/', UserNotificationListView.as_view(), name='user-notifications'),
    path('notifications/mark-read/', mark_notifications_as_read, name='notification-mark-read'),
]