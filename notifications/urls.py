from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserNotificationListView, mark_notifications_as_read, 
    UnreadNotificationListView, ReadNotificationListView,
    ReminderRawView, ReminderViewSet
)

router = DefaultRouter()
router.register(r'reminders', ReminderViewSet, basename='reminder')

urlpatterns = [
    path('notifications/<int:account_id>/all/', UserNotificationListView.as_view(), name='user-notifications'),
    path('notifications/<int:account_id>/mark-read/', mark_notifications_as_read, name='notification-mark-read'),
    path('notifications/<int:account_id>/unread/', UnreadNotificationListView.as_view(), name='unread-notifications'),
    path('notifications/<int:account_id>/read/', ReadNotificationListView.as_view(), name='read-notifications'),
    path('reminders/<int:account_id>/<int:subject_id>/<int:academic_year_id>/<int:semester_id>/', ReminderRawView.as_view(), name='get-data-to-reminder'),

    # CRUD reminders (list/create/update/delete)
    path('', include(router.urls)),
]