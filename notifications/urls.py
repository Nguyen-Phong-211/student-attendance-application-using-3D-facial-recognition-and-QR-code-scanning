from django.urls import path
from .views import UserNotificationListView, mark_notifications_as_read, UnreadNotificationListView

urlpatterns = [
    path('notifications/<int:account_id>/all/', UserNotificationListView.as_view(), name='user-notifications'),
    path('notifications/<int:account_id>/mark-read/', mark_notifications_as_read, name='notification-mark-read'),
    path('notifications/<int:account_id>/unread/', UnreadNotificationListView.as_view(), name='unread-notifications'),
]