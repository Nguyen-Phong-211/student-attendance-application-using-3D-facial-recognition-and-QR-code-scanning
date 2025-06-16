from django.urls import path
from .views import RoomListAPIView

urlpatterns = [
    path('all/', RoomListAPIView.as_view(), name='room-list'),
]
