from django.urls import path
from . import views
from .views import LecturerSendToStudentAPIView

urlpatterns = [
    path("", views.ContactCreateAPIView.as_view(), name="contact-create-api"),  # React gọi AP
    #TRANG
    path("lecturer-send/", LecturerSendToStudentAPIView.as_view(), name="lecturer-send"),  # lecturer gửi
]