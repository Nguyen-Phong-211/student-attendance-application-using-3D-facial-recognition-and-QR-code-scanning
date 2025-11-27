from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Contact
from .serializers import ContactSerializer, ContactListSerializer, ContactDetailSerializer, ContactReplySerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from subjects.models import Subject
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from students.models import Student
from lecturers.models import Lecturer
from accounts.models import Account
from staffs.models import Staff

# ==============================
# CUSTOM PERMISSION
# ==============================
class IsAppAdmin(BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'admin'

# ==============================
# Add contact serializer
# ==============================
class ContactCreateAPIView(generics.CreateAPIView):
    """
    Create a new contact
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Get the student associated with the current user
        student = getattr(self.request.user, 'student', None)
        if not student:
            raise ValueError("Current user is not a student.")
        serializer.save(from_person=student)

class LecturerSendToStudentAPIView(generics.CreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        lecturer = getattr(self.request.user, 'lecturer', None)
        if not lecturer:
            raise ValueError("Current user is not a lecturer.")
        serializer.save(from_person=lecturer, type_person_contact=Contact.TypePersonContact.LECTURER)

# ==============================
# LIST CONTACTS FOR CURRENT USER
# ==============================
class ContactListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        contacts = Contact.objects.filter(
            to_person_id=user.account_id, 
        ).select_related('subject').order_by('-created_at')
        serializer = ContactListSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ==============================
# DETAIL CONTACT
# ==============================
class ContactDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, contact_id):
        user = request.user
        user_type = ContentType.objects.get_for_model(user.__class__)
        try:
            contact = Contact.objects.get(
                contact_id=contact_id,
                to_person_type=user_type,
                to_person_id=user.account_id
            )
        except Contact.DoesNotExist:
            return Response(
                {"error": "Liên hệ không tồn tại hoặc không thuộc quyền của bạn"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ContactDetailSerializer(contact)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==============================
# REPLY CONTACT
# ==============================
class ContactReplyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, contact_id):
        try:
            contact = Contact.objects.get(contact_id=contact_id)
        except Contact.DoesNotExist:
            return Response({'detail': 'Contact not found'}, status=status.HTTP_404_NOT_FOUND)

        response_text = request.data.get('response')
        if not response_text:
            return Response({'detail': 'Response is required'}, status=status.HTTP_400_BAD_REQUEST)

        contact.response = response_text
        contact.status = Contact.Status.REPLIED
        contact.status_response = Contact.Status.REPLIED
        contact.updated_at = timezone.now()
        contact.save()

        # Send email to notify the contact sender
        self.send_contact_reply_email(contact)

        return Response({'detail': 'Phản hồi thành công'}, status=status.HTTP_200_OK)
    
    # Send email notification to the contact sender
    def send_contact_reply_email(self, contact: Contact):
        recipient_email = contact.email
        recipient_name = contact.fullname or "Người dùng"
        if contact.type_person_contact == 'LECTURER':
            try:
                lecturer = Lecturer.objects.get(account__email=contact.email)
                recipient_name = lecturer.fullname
            except Lecturer.DoesNotExist:
                print(f"[WARNING] No Lecturer found with email {contact.email}")

        elif contact.type_person_contact == 'ADMIN':
            try:
                from accounts.models import Account
                admin = Account.objects.get(email=contact.email)
                recipient_name = getattr(admin, 'fullname', getattr(admin, 'username', 'Người dùng'))
            except Account.DoesNotExist:
                print(f"[WARNING] No Admin Account found with email {contact.email}")

        elif contact.type_person_contact == 'STUDENT':
            pass

        if not recipient_email:
            print(f"[WARNING] Contact {contact.contact_id} has no valid email to send.")
            return

        responder = self.request.user
        responder_name = getattr(responder, 'fullname', getattr(responder, 'username', 'Hệ thống'))

        updated_time = timezone.localtime(contact.updated_at).strftime('%d/%m/%Y %H:%M:%S')
        created_time = timezone.localtime(contact.created_at).strftime('%d/%m/%Y %H:%M:%S')

        html_content = render_to_string(
            'contact/contact_reply.html',
            {
                'name': recipient_name,
                'message': contact.message,
                'response': contact.response,
                'createdTime': created_time,
                'updatedTime': updated_time,
                'fullName': responder_name,
            }
        )

        subject = "Phản hồi liên hệ từ ATTEND 3D"
        email = EmailMultiAlternatives(subject, "", to=[recipient_email])
        email.attach_alternative(html_content, "text/html")
        try:
            email.send()
            print(f"[INFO] Email sent to {recipient_email}")
        except Exception as e:
            print(f"[ERROR] Failed to send email to {recipient_email}: {e}")
