from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import (
    LecturerListSerializer, AllLecturerSerializer, LecturerAssignmentSerializer, 
    LecturerWithSubjectsSerializer, LecturerContactSerializer, TotalLecturerSerializer
)
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from .models import Lecturer, LecturerSubject
from lecturers.utils.email.assignment_class_subject_email import send_assignment_email
from classes.models import Class
from subjects.models import Subject, Semester
from audit.models import AuditLog
from notifications.models import Notification
from lecturers.utils.request import get_client_ip
from django.db import connection
from rest_framework.decorators import api_view, permission_classes

# ==================================================
# LECTURER LIST VIEW
# ==================================================
class LecturerListAPIView(generics.ListAPIView):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerListSerializer
    permission_classes = [permissions.IsAuthenticated]

# ==================================================
# ALL LECTURER VIEW
# ==================================================
class AllLecturerView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        lecturers = Lecturer.objects.select_related('account').all()
        serializer = LecturerListSerializer(lecturers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ==================================================
# LECTURER ASSIGNMENT VIEW
# ==================================================
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

            # Only send an email
            # send_assignment_email(
            #     to_email=lecturer.account.email,
            #     full_name=lecturer.fullname,
            #     subject_name=subject_names_str,
            #     class_name=class_obj.class_name,
            # )

            return Response({
                "message": "Gán giảng viên và gửi email thành công",
                "data": result
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==================================================
# LECTURER WITH SUBJECT VIEW
# ==================================================
class LecturerWithSubjectsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        lecturers = Lecturer.objects.select_related('account', 'department') \
            .prefetch_related('lecturersubject_set__subject',
                              'subjectclass_set__subject',
                              'subjectclass_set__class_id',
                              'subjectclass_set__semester') 

        serializer = LecturerWithSubjectsSerializer(lecturers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ==================================================
# LECTURER CONTACT VIEW
# ==================================================
class LecturerContactAPIView(APIView):
    def get(self, request):
        query = """
        SELECT
            sub.subject_id,
            sub.subject_name,
            l.fullname,
            acc.email,
            acc.phone_number,
            acc.avatar
        FROM subject_registration_requests srs
            JOIN schedules sh ON sh.schedule_id = srs.schedule_id
            JOIN lecturer_subjects ls ON ls.subject_id = sh.subject_id_id
            JOIN lecturers l ON l.lecturer_id = ls.lecturer_id
            JOIN accounts acc ON acc.account_id = l.account_id
            JOIN subjects sub ON ls.subject_id = sub.subject_id
        WHERE srs.status = 'approved'
            AND sh.status = '1'
            AND acc.is_locked = false
        """

        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            results = cursor.fetchall()
            rows = [dict(zip(columns, row)) for row in results]

        serializer = LecturerContactSerializer(rows, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# AMIN: Caculation the total of lecturer
# ==================================================
class TotalLecturerView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        total = Lecturer.objects.count()
        serializer = TotalLecturerSerializer({'total_lecturer': total})
        return Response(serializer.data, status=status.HTTP_200_OK)