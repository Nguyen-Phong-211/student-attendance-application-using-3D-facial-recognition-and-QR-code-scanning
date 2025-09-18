from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import (
    StudentSerializer, DepartmentSerializer, MajorSerializer, 
    AllStudentGetListSerializer, StudentCreateSerializer, StudentUpdateSerializer, 
    SubjectRegistrationRequestSerializer, StudentScheduleSerializer, StudentSubjectBySemesterSerializer,
    StudentSemesterAcademicYearSerializer
)
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
from subjects.models import Subject
from rest_framework.permissions import AllowAny

# ==================================================
# Get client ip
# ==================================================
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
# ==================================================
# Create student
# ==================================================
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
# ==================================================
# Get list department
# ==================================================
class DepartmentListAPIView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
# ==================================================
# Get list major
# ==================================================
class MajorListAPIView(APIView):
    def get(self, request):
        majors = Major.objects.select_related('department').all()
        serializer = MajorSerializer(majors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Get list student
# ==================================================
class StudentListView(APIView):
    def get(self, request):
        students = Student.objects.select_related('account').all()
        serializer = StudentGetListSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Get list all student
# ==================================================
class AllStudentGetListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        students = Student.objects.select_related(
            'account', 'major__department', 'department'
        ).all()
        serializer = AllStudentGetListSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Create student account 
# ==================================================
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

# ==================================================
# Update major
# ==================================================
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
# ==================================================
# Update student
# ==================================================
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

# ==================================================
# Register subjection request
# ==================================================
class SubjectRegistrationRequestCreateView(generics.CreateAPIView):
    serializer_class = SubjectRegistrationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        student = self.request.user.student
        subject = serializer.validated_data['subject']
        semester = serializer.validated_data['semester']

        # Get schedule of subject to register
        new_schedules = Schedule.objects.filter(subject_id=subject)

        # Get existing schedules of student in the same semester
        existing_subjects = StudentSubject.objects.filter(
            student=student,
            semester=semester
        ).select_related('subject')

        # 1. Check conflict schedule
        for existing in existing_subjects:
            existing_schedules = Schedule.objects.filter(subject_id=existing.subject)
            for s1 in new_schedules:
                for s2 in existing_schedules:
                    if s1.day_of_week == s2.day_of_week:
                        if s1.start_time < s2.end_time and s1.end_time > s2.start_time:
                            raise ValidationError(f"Môn {subject} trùng giờ với {existing.subject}")

        # 2. Check room capacity for each schedule
        for schedule in new_schedules:
            room = schedule.room
            # Count registered students for this subject in the same semester
            registered_count = StudentSubject.objects.filter(
                subject=schedule.subject_id,
                semester=semester,
                subject_registration_request__status='approved'
            ).count()

            if registered_count >= room.capacity:
                raise ValidationError(
                    f"Phòng {room.room_name} cho môn {subject} đã đầy ({registered_count}/{room.capacity} sinh viên)"
                )

        # 3. If no error, save
        serializer.save(student=student)

# ==================================================
# View submitted course registration requests
# ==================================================
class SubjectRegistrationRequestListView(generics.ListAPIView):
    """
    API for students to view submitted course registration requests
    """
    serializer_class = SubjectRegistrationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SubjectRegistrationRequest.objects.filter(student=self.request.user.student)

# ==================================================
# View student schedule in a week
# ==================================================
class StudentScheduleView(APIView):
    def get(self, request, account_id):
        # 1. Get student_id from account_id
        student = Student.objects.filter(account_id=account_id).first()
        if not student:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        student_id = student.student_id

        query = """
        WITH week AS (
            SELECT date_trunc('week', CURRENT_DATE)::date AS week_start
        ),

        student_classes AS (
            SELECT cs.class_id_id AS class_id
            FROM class_students cs
            WHERE cs.student_id = %s
            AND cs.is_active = '1'
        ),

        student_subjects_sem AS (
            SELECT ss.subject_id, ss.semester_id, semes.semester_name, semes.start_date, semes.end_date
            FROM student_subjects ss JOIN semesters semes ON ss.semester_id = semes.semester_id
            WHERE ss.student_id = %s
        ),

        subject_classes_filtered AS (
            SELECT sc.subject_class_id, sc.subject_id, sc.class_id_id AS class_id, sc.lecturer_id
            FROM subject_classes sc
            WHERE sc.class_id_id IN (SELECT class_id FROM student_classes)
        ),

        schedules_filtered AS (
            SELECT s.*, ls.slot_name, r.room_name, l.fullname AS lecturer_name
            FROM schedules s
            JOIN lesson_slots ls ON s.slot_id = ls.slot_id
            JOIN rooms r ON s.room_id = r.room_id
            JOIN subjects AS subj ON subj.subject_id = s.subject_id_id
            JOIN lecturer_subjects AS lsubj ON lsubj.subject_id = subj.subject_id
            LEFT JOIN lecturers l ON l.lecturer_id = lsubj.lecturer_id
            WHERE s.class_id_id IN (SELECT class_id FROM student_classes) AND s.status = '1'
        )

        SELECT DISTINCT ON (s.schedule_id)
            st.student_id,
            st.fullname AS student_name,
            subj.subject_id,
            subj.subject_name,
            c.class_id,
            c.class_name,
            ss.start_date AS semeter_start_date,
            ss.end_date AS semester_end_date,
            sc.subject_class_id,
            s.status AS status_schedule,
            s.repeat_weekly,
            s.lecturer_name,
            s.schedule_id,
            s.day_of_week,
            s.slot_name,
            s.start_time::time AS lesson_start,
            s.end_time::time AS lesson_end,
            CASE 
                WHEN s.repeat_weekly = '1' THEN
                    w.week_start::timestamp 
                    + ((COALESCE(s.day_of_week, EXTRACT(ISODOW FROM s.start_time)::int) - 1) || ' day')::interval
                    + s.start_time::time
                ELSE s.start_time
            END AS occurrence_start,

            CASE 
                WHEN s.repeat_weekly = '1' THEN
                    w.week_start::timestamp 
                    + ((COALESCE(s.day_of_week, EXTRACT(ISODOW FROM s.start_time)::int) - 1) || ' day')::interval
                    + s.end_time::time
                ELSE s.end_time
            END AS occurrence_end,
            s.room_name,
            s.latitude,
            s.longitude,
            s.lesson_type
        FROM student_subjects_sem ss
        JOIN students st ON st.student_id = %s AND st.status = '1'
        JOIN subjects subj ON ss.subject_id = subj.subject_id
        JOIN subject_classes_filtered sc ON sc.class_id = ANY(SELECT class_id FROM student_classes)
        JOIN classes c ON c.class_id = sc.class_id
        JOIN schedules_filtered s ON s.class_id_id = sc.class_id
        CROSS JOIN week w
        ORDER BY s.schedule_id, occurrence_start;
        """

        # 2. Query
        with connection.cursor() as cursor:
            cursor.execute(query, [student_id, student_id, student_id])
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # 3. Serialize the returned data
        serializer = StudentScheduleSerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Get data subjects of student following by semecter view
# ==================================================
class StudentSubjectBySemesterView(APIView):
    """
    API to get list of student subjects by semester_id using account_id
    """
    def get(self, request, account_id, semester_id):
        # Get student from account_id
        student = Student.objects.filter(account_id=account_id).first()
        if not student:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get list of student subjects
        subjects_qs = Subject.objects.filter(
            studentsubject__student=student,
            studentsubject__semester_id=semester_id,
            status='1'  # Active subjects only
        ).values('subject_id', 'subject_name')

        serializer = StudentSubjectBySemesterSerializer(subjects_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Get student, semester and academic year by account_id
# ==================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def get_student_semester(request, account_id):
    """
    Lấy student, semester, academic year theo account_id
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT DISTINCT
                st.student_id,
                st.fullname,
                ss.semester_id,
                sem.semester_name,
                ay.academic_year_id,
                ay.academic_year_name
            FROM students st
            JOIN accounts acc ON acc.account_id = st.account_id
            JOIN student_subjects ss ON st.student_id = ss.student_id
            JOIN semesters sem ON ss.semester_id = sem.semester_id
            JOIN academic_years ay ON sem.academic_year_id = ay.academic_year_id
            WHERE acc.account_id = %s AND sem.status = '1'
        """, [account_id])

        rows = cursor.fetchall()

    data = [
        {
            "student_id": row[0],
            "fullname": row[1],
            "semester_id": row[2],
            "semester_name": row[3],
            "academic_year_id": row[4],
            "academic_year_name": row[5],
        }
        for row in rows
    ]

    serializer = StudentSemesterAcademicYearSerializer(data, many=True)
    return Response(serializer.data)