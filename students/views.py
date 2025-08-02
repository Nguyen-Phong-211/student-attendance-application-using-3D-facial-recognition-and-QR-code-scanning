from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import StudentSerializer, DepartmentSerializer, MajorSerializer, AllStudentGetListSerializer, StudentCreateSerializer
from .models import Department, Major
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from students.serializers import StudentGetListSerializer
from .models import Student
from rest_framework.decorators import api_view, permission_classes
from notifications.models import Notification
from audit.models import AuditLog
from django.shortcuts import get_object_or_404
from accounts.models import Account

from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class CreateStudentView(APIView):
    permission_classes = [permissions.IsAuthenticated] 

    def post(self, request):
        serializer = StudentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Sinh viên tạo thành công'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DepartmentListAPIView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class MajorListAPIView(APIView):
    def get(self, request):
        majors = Major.objects.select_related('department').all()
        serializer = MajorSerializer(majors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class StudentListView(APIView):
    def get(self, request):
        students = Student.objects.select_related('account').all()
        serializer = StudentGetListSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AllStudentGetListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        students = Student.objects.select_related(
            'account', 'major__department', 'department'
        ).all()
        serializer = AllStudentGetListSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_student(request):
    serializer = StudentCreateSerializer(data=request.data)
    if serializer.is_valid():
        student = serializer.save()
        account = student.account
        
        name = student.fullname
        phone = account.phone_number
        password = request.data.get('password')
        email = account.email
        
        Notification.objects.create(
            title=f'Bạn đã thêm sinh viên {student.fullname} thành công vào hệ thống',
            content=f'Bạn đã tạo tài khoản và thêm sinh viên {student.fullname} thành công. Email gửi thông báo thành công.',
            created_by=request.user
        )
        
        AuditLog.objects.create(
            operation='C',
            old_data={},
            new_data = {
                "student_id": student.student_id,
                "student_code": student.student_code,
                "fullname": student.fullname,
                "gender": student.gender,
                "dob": str(student.dob),
                "status": student.status,
                "department_id": student.department_id,
                "major_id": student.major_id,
            },
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changed_by=request.user,
            record_id=str(account.pk),
            entity_id=str(account.pk),
            entity_name='Student',
            action_description=f"Thêm sinh viên: {name} thành công"
        )
        
        AuditLog.objects.create(
            operation='C',
            old_data={},
            new_data = {
                "account_id": account.pk,
                "email": account.email,
                "phone_number": account.phone_number,
                "role": account.role.role_name,
                "user_type": account.user_type,
                "is_active": account.is_active,
            },
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changed_by=request.user,
            record_id=str(account.pk),
            entity_id=str(account.pk),
            entity_name='Account',
            action_description=f"Thêm tài khoản: {name} thành công"
        )
        
        html_content = render_to_string("account/create_multiple_account.html", {
            "name": name,
            "phone": phone,
            "password": password,
        })

        subject = "Tài khoản đăng nhập hệ thống điểm danh"
        from_email = "zephyrnguyen.vn@gmail.com"

        msg = EmailMultiAlternatives(subject, '', from_email, [email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        return Response({
            "message": "Thêm sinh viên thành công!",
            "student_code": student.student_code
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Update major
class MajorUpdateAPIView(APIView):
    def put(self, request, pk):
        major = get_object_or_404(Major, pk=pk)
        serializer = MajorSerializer(major, data=request.data, partial=True)
        if serializer.is_valid():
            request._changed_by = request.user
            request._request_data = request.data 
            serializer.save()
            return Response({"message": "Cập nhật thành công", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)