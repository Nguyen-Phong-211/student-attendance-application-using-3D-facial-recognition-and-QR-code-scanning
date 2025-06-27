from django.urls import path
from .views import LecturerListAPIView, AllLecturerView, LecturerAssignmentAPIView

urlpatterns = [
    path('all/', LecturerListAPIView.as_view(), name='get-list-all-lecturer'),
    path('assignment-class/', LecturerAssignmentAPIView.as_view(), name='lecturer-assignment'),
]