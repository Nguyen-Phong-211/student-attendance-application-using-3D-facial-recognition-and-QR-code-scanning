from django.urls import path
from .views import LecturerListAPIView

urlpatterns = [
    path('all/', LecturerListAPIView.as_view(), name='get-list-all-lecturer'),
]