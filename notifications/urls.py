from django.urls import path
from .views import UserNotificationListView

urlpatterns = [
    path('notifications/all/', UserNotificationListView.as_view(), name='user-notifications'),
]