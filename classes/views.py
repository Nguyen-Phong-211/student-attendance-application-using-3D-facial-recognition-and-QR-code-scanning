from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from students.models import Department
from students.serializers import DepartmentSerializer
from .models import Class
from students.models import Major
from .serializers import MajorSerializer, ClassSerializer, ClassCreateSerializer
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
                is_read='0'
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
