from django.urls import path
from . import views
from .views import LecturerSendToStudentAPIView, ContactListAPIView, ContactDetailAPIView, ContactReplyAPIView

urlpatterns = [
    # Prefix: endpoint: api/v1/contacts/
    path("", views.ContactCreateAPIView.as_view(), name="contact-create-api"),  # React gọi AP
    path("lecturer-send/", LecturerSendToStudentAPIView.as_view(), name="lecturer-send"),

    # List contacts
    path("list/", ContactListAPIView.as_view(), name="contact-list"),
    # Reply to contact
    path("<int:contact_id>/reply/", ContactReplyAPIView.as_view(), name="contact-reply"),
    # Detail contact
    path("<int:contact_id>/", ContactDetailAPIView.as_view(), name="contact-detail"),
]