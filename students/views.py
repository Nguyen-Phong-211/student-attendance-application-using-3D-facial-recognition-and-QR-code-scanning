from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import StudentSerializer, DepartmentSerializer, MajorSerializer, AllStudentGetListSerializer, StudentCreateSerializer, StudentUpdateSerializer, SubjectRegistrationRequestSerializer, StudentScheduleSerializer
from .models import Department, Major
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from students.serializers import StudentGetListSerializer
from .models import Student, StudentSubject
from rest_framework.decorators import api_view, permission_classes
from notifications.models import Notification
from audit.models import AuditLog
from django.shortcuts import get_object_or_404
from accounts.models import Account
from classes.models import Schedule

from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.db import connection
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

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
            student = serializer.save()
            return Response({
                'success': True,
                'message': 'Sinh viên tạo thành công',
                'student_id': student.student_id
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
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

# update student
class StudentUpdateAPIView(APIView):
    def get(self, request, account_id):
        try:
            account = Account.objects.get(account_id=account_id)
        except Account.DoesNotExist:
            return Response({"error": "Account không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        student = getattr(account, "student", None)
        if not student:
            return Response({"error": "Sinh viên chưa tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        data = {
            "student_id": student.student_id,
            "fullname": student.fullname,
            "student_code": student.student_code,
            "phone_number": account.phone_number,
            "email": account.email,
            "gender": student.gender,
            "dob": student.dob,
            "department_id": student.department_id,
            "major_id": student.major_id,
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, account_id):
        try:
            account = Account.objects.get(account_id=account_id)
        except Account.DoesNotExist:
            return Response({"error": "Account không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(account, "student") and account.student is not None:
            return Response(
                {"message": "Sinh viên đã tồn tại, không thể thêm mới"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = StudentUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(account, serializer.validated_data)
            return Response({"message": "Thêm sinh viên thành công"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ========================= REGISTRATION REQUESTS CREATE =========================
class SubjectRegistrationRequestCreateView(generics.CreateAPIView):
    serializer_class = SubjectRegistrationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        student = self.request.user.student
        subject = serializer.validated_data['subject']
        semester = serializer.validated_data['semester']

        # Lấy schedule của môn đăng ký mới
        new_schedules = Schedule.objects.filter(subject_id=subject)

        # Lấy các môn đã đăng ký trong cùng kỳ
        existing_subjects = StudentSubject.objects.filter(
            student=student,
            semester=semester
        ).select_related('subject')

        # 1. Kiểm tra trùng giờ
        for existing in existing_subjects:
            existing_schedules = Schedule.objects.filter(subject_id=existing.subject)
            for s1 in new_schedules:
                for s2 in existing_schedules:
                    if s1.day_of_week == s2.day_of_week:
                        if s1.start_time < s2.end_time and s1.end_time > s2.start_time:
                            raise ValidationError(f"Môn {subject} trùng giờ với {existing.subject}")

        # 2. Kiểm tra số lượng slot theo phòng
        for schedule in new_schedules:
            room = schedule.room
            # Đếm số sinh viên đã đăng ký môn này
            registered_count = StudentSubject.objects.filter(
                subject=schedule.subject_id,
                semester=semester,
                subject_registration_request__status='approved'
            ).count()

            if registered_count >= room.capacity:
                raise ValidationError(
                    f"Phòng {room.room_name} cho môn {subject} đã đầy ({registered_count}/{room.capacity} sinh viên)"
                )

        # Nếu ok, lưu request
        serializer.save(student=student)

# ========================= REGISTRATION REQUESTS VIEW =========================
class SubjectRegistrationRequestListView(generics.ListAPIView):
    """
    API for students to view submitted course registration requests
    """
    serializer_class = SubjectRegistrationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SubjectRegistrationRequest.objects.filter(student=self.request.user.student)

# ========================= SCHEDULE =========================
class StudentScheduleView(APIView):
    def get(self, request, account_id):
        # 1. Get student_id from account_id
        student = Student.objects.filter(account_id=account_id).first()
        if not student:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        student_id = student.student_id

        # 2. Raw SQL Query (CTE)
        query = """
        WITH week AS (
          SELECT date_trunc('week', CURRENT_DATE)::date AS week_start,
                 (date_trunc('week', CURRENT_DATE) + interval '7 day')::date AS week_end
        ),
        base AS (
          SELECT 
              st.student_id,
              st.fullname AS student_name,
              subj.subject_id,
              subj.subject_name,
              c.class_id,
              c.class_name,
              sc.subject_class_id,
              l.fullname AS lecturer_name,
              s.schedule_id,
              s.day_of_week,
              ls.slot_name,
              ls.start_time AS lesson_start,
              ls.end_time   AS lesson_end,
              s.repeat_weekly,
              s.start_time  AS schedule_start,
              s.end_time    AS schedule_end,
              s.lesson_type,
              r.room_name,
              s.latitude,
              s.longitude,
              w.week_start
          FROM student_subjects ss
          JOIN students st            ON ss.student_id = st.student_id
          JOIN subjects subj          ON ss.subject_id = subj.subject_id
          JOIN subject_classes sc     ON sc.subject_id = subj.subject_id
                                     AND sc.semester_id = ss.semester_id
          JOIN classes c              ON sc.class_id_id = c.class_id
          JOIN schedules s            ON s.subject_id_id = subj.subject_id
          JOIN lesson_slots ls        ON s.slot_id = ls.slot_id
          JOIN rooms r                ON s.room_id = r.room_id
          LEFT JOIN lecturers l       ON sc.lecturer_id = l.lecturer_id
          CROSS JOIN week w
          WHERE ss.student_id = %s AND st.status = '1' AND r.status = '1'
            AND (
                 s.repeat_weekly = '1'
                 OR (s.start_time >= w.week_start AND s.start_time < w.week_start + interval '7 day')
            )
        ),
        events AS (
          SELECT
            *,
            CASE 
              WHEN repeat_weekly = '1' THEN
                (week_start::timestamp
                 + ((COALESCE(day_of_week, EXTRACT(ISODOW FROM schedule_start)::int) - 1) || ' day')::interval
                 + lesson_start::time)
              ELSE schedule_start
            END AS occurrence_start,
            CASE 
              WHEN repeat_weekly = '1' THEN
                (week_start::timestamp
                 + ((COALESCE(day_of_week, EXTRACT(ISODOW FROM schedule_start)::int) - 1) || ' day')::interval
                 + lesson_end::time)
              ELSE schedule_end
            END AS occurrence_end
          FROM base
        )
        SELECT 
          student_id, student_name,
          subject_id, subject_name,
          class_id, class_name, subject_class_id,
          lecturer_name,
          schedule_id, 
          day_of_week,
          CASE day_of_week
               WHEN 1 THEN 'Thứ 2'
               WHEN 2 THEN 'Thứ 3'
               WHEN 3 THEN 'Thứ 4'
               WHEN 4 THEN 'Thứ 5'
               WHEN 5 THEN 'Thứ 6'
               WHEN 6 THEN 'Thứ 7'
               WHEN 7 THEN 'Chủ nhật'
          END AS weekday_name,
          slot_name,
          lesson_start, lesson_end,
          occurrence_start, occurrence_end,
          room_name,
          latitude,
          longitude,
          lesson_type
        FROM events
        ORDER BY occurrence_start;
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [student_id])
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # 3. Serialize the returned data
        serializer = StudentScheduleSerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)