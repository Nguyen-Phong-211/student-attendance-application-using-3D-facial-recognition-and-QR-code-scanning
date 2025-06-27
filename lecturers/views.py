from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import LecturerListSerializer, AllLecturerSerializer, LecturerAssignmentSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Lecturer
from lecturers.utils.email.assignment_class_subject_email import send_assignment_email
from classes.models import Class
from subjects.models import Subject, Semester
from audit.models import AuditLog
from notifications.models import Notification
from lecturers.utils.request import get_client_ip

class LecturerListAPIView(generics.ListAPIView):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class AllLecturerView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        lecturers = Student.objects.select_related('account').all()
        serializer = StudentGetListSerializer(lecturers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class LecturerAssignmentAPIView(APIView):
    def post(self, request):
        serializer = LecturerAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()

            lecturer_id = request.data['lecturer_id']
            subject_ids = request.data['subject_ids']
            class_id = request.data['class_id']
            semester_id = request.data['semester_id']

            # Query data
            lecturer = Lecturer.objects.select_related('account').get(pk=lecturer_id)
            class_obj = Class.objects.get(pk=class_id)
            semester = Semester.objects.get(pk=semester_id)

            # Merge subject_name to a name
            subject_names = Subject.objects.filter(pk__in=subject_ids).values_list('subject_name', flat=True)
            subject_names_str = ", ".join(subject_names)

            # Only send an email
            send_assignment_email(
                to_email=lecturer.account.email,
                full_name=lecturer.fullname,
                subject_name=subject_names_str,
                class_name=class_obj.class_name,
            )

            # Send notification
            Notification.objects.create(
                title=f"Phân công giảng viên {lecturer.fullname}",
                content=f"Giảng viên {lecturer.fullname} được phân công dạy môn {subject_names_str} cho lớp {class_obj.class_name} (học kỳ {semester.semester_name}).",
                created_by=request.user
            )

            return Response({
                "message": "Gán giảng viên và gửi email thành công",
                "data": result
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)