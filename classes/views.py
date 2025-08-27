from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from students.models import Department
from students.serializers import DepartmentSerializer
from .models import Class, Schedule
from students.models import Major
from .serializers import MajorSerializer, ClassSerializer, ClassCreateSerializer, ClassUpdateSerializer, ScheduleSerializer
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework import status
from notifications.models import Notification
from audit.models import AuditLog
import json
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .utils.request import get_client_ip, get_user_agent
from lecturers.models import SubjectClass

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@api_view(['GET'])
def get_departments(request):
    departments = Department.objects.all()
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_major_by_department(request, department_id):
    majors = Major.objects.filter(department_id=department_id)
    serializer = MajorSerializer(majors, many=True)
    return Response(serializer.data)

class ClassListAPIView(APIView):
    def get(self, request):
        classes = Class.objects.all()
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)

# Create a class
class ClassCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ClassCreateSerializer(data=request.data)
        if serializer.is_valid():
            new_class = serializer.save()
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{request.user.account_id}",
                {
                    "type": "send.notification",
                    "content": {
                        "title": "Lớp học mới đã được tạo",
                        "message": f"Lớp {new_class.class_name} đã được thêm vào.",
                    }
                }
            )
            
            Notification.objects.create(
                title="Lớp học mới đã được tạo",
                content=f"Lớp {new_class.class_name} đã được thêm vào hệ thống.",
                created_by=request.user,
                is_read='0',
                to_target=request.user
            )
            
            AuditLog.objects.create(
                operation='C',
                old_data={},
                new_data=serializer.data,
                changed_by=request.user,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                record_id=str(new_class.pk),
                entity_id=str(new_class.pk),
                entity_name='Class',
                action_description=f"Người dùng tạo lớp {new_class.class_name}"
            )
            
            return Response({
                'message': 'Tạo lớp học thành công',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Update class
class ClassUpdateAPIView(APIView):
    def put(self, request, pk):
        try:
            class_instance = Class.objects.get(pk=pk)
        except Class.DoesNotExist:
            return Response({"error": "Lớp học không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ClassUpdateSerializer(class_instance, data=request.data)
        if serializer.is_valid():
            
            class_instance._changed_by = request.user
            class_instance._ip_address = get_client_ip(request)
            class_instance._user_agent = get_user_agent(request)

            serializer.save()

            return Response({
                "message": "Cập nhật thành công",
                "data": serializer.data
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ======================= SCHEDULE ======================= #
class ScheduleListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, subject_id=None, semester_id=None):
        if not subject_id or not semester_id:
            return Response(
                {"error": "subject_id và semester_id là bắt buộc"},
                status=status.HTTP_400_BAD_REQUEST
            )

        subject_classes = SubjectClass.objects.filter(
            subject_id=subject_id,
            semester_id=semester_id,
            subject__status='1',
            class_id__status='1'
        ).select_related("lecturer", "class_id", "subject")

        if not subject_classes.exists():
            return Response([], status=status.HTTP_200_OK)

        schedules = Schedule.objects.filter(
            subject_id=subject_id
        ).select_related("room", "slot__shift_id")

        serializer = ScheduleSerializer(
            schedules,
            many=True,
            context={
                "subject_id": subject_id,
                "semester_id": semester_id
            }
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
