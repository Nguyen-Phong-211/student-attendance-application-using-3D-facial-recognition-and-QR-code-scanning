from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import (
    StudentSerializer, DepartmentSerializer, MajorSerializer, 
    AllStudentGetListSerializer, StudentCreateSerializer, StudentUpdateSerializer, 
    SubjectRegistrationRequestSerializer, StudentScheduleSerializer, StudentSubjectBySemesterSerializer,
    StudentSemesterAcademicYearSerializer, AdminScheduleManagementSerializer, StudentCodeSerializer, TotalStudentSerializer, 
    ApproveScheduleSerializer, CountSubjectRegistrationRequestSerializer
)
from .models import Department, Major
from rest_framework import generics
from students.serializers import StudentGetListSerializer
from .models import Student, StudentSubject, SubjectRegistrationRequest
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
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

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

        serializer = StudentUpdateSerializer(data=request.data)
        if serializer.is_valid():
            # Check if student already exists
            if hasattr(account, "student") and account.student is not None:
                serializer.update(account, serializer.validated_data)
                return Response({"message": "Cập nhật sinh viên thành công"}, status=status.HTTP_200_OK)
            else:
                # If not, create a new student
                Student.objects.create(
                    account=account,
                    **serializer.validated_data
                )
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
        SubjectRegistrationRequest.objects.create(
                student=student,
                subject=subject,
                semester=semester,
                schedule=schedule,
                approved_by=None
            )

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
        )
        SELECT DISTINCT ON (sch.schedule_id)
            st.student_id,
            st.student_code,
            st.fullname AS student_name,
            sub.subject_id,
            sub.subject_name,
            cl.class_id,
            cl.class_name,
            se.start_date AS semester_start_date,
            se.end_date AS semester_end_date,
            l.lecturer_id,
            l.fullname AS lecturer_name,
            sch.schedule_id,
            sch.day_of_week,
            sch.repeat_weekly,
            sch.lesson_type,
            sch.latitude,
            sch.longitude,
            ls.slot_id,
            ls.slot_name,
            r.room_id,
            r.room_name,
            r.capacity,
            sh.shift_id,
            sh.shift_name,
            sh.start_time AS shift_start_time,
            sh.end_time AS shift_end_time,
            ss.max_leave_days,
            sch.start_time::time AS lesson_start,
            sch.end_time::time AS lesson_end,
            CASE 
                WHEN sch.repeat_weekly = '1' THEN
                    w.week_start::timestamp 
                    + ((COALESCE(sch.day_of_week, EXTRACT(ISODOW FROM sch.start_time)::int) - 1) || ' day')::interval
                    + sch.start_time::time
                ELSE sch.start_time
            END AS occurrence_start,
            CASE 
                WHEN sch.repeat_weekly = '1' THEN
                    w.week_start::timestamp 
                    + ((COALESCE(sch.day_of_week, EXTRACT(ISODOW FROM sch.start_time)::int) - 1) || ' day')::interval
                    + sch.end_time::time
                ELSE sch.end_time
            END AS occurrence_end
        FROM schedules AS sch
        JOIN subjects AS sub ON sub.subject_id = sch.subject_id_id
        JOIN classes AS cl ON cl.class_id = sch.class_id_id
        JOIN subject_registration_requests AS srr ON srr.schedule_id = sch.schedule_id
        JOIN lesson_slots AS ls ON ls.slot_id = sch.slot_id
        JOIN shifts AS sh ON sh.shift_id = ls.shift_id_id
        JOIN rooms AS r ON r.room_id = sch.room_id
        JOIN students AS st ON st.student_id = srr.student_id
        JOIN semesters AS se ON se.semester_id = srr.semester_id
        JOIN lecturer_subjects AS lsub ON lsub.subject_id = srr.subject_id
        JOIN lecturers AS l ON l.lecturer_id = lsub.lecturer_id
        JOIN student_subjects AS ss ON ss.subject_registration_request_id = srr.subject_registration_request_id
        CROSS JOIN week w
        WHERE srr.status = 'approved'
        AND srr.student_id = %s
        AND sch.status = '1'
        AND sh.status = '1'
        AND sub.status = '1'
        AND cl.status = '1'
        AND r.status = '1'
        AND se.status = '1'
        ORDER BY sch.schedule_id, occurrence_start;
        """

        # 2. Query
        with connection.cursor() as cursor:
            cursor.execute(query, [student_id])
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
# ==================================================
# ADMIN: Get schedule of student by student_code
# ==================================================
class AdminScheduleManagementView(APIView):
    """
    API to get schedule of student by student_code
    """
    permission_classes = [IsAdminUser]
    def get(self, request, student_code):
        query = """
        SELECT DISTINCT ON (sch.schedule_id)
            srr.subject_registration_request_id, 
            srr.reason,
            srr.status AS register_status,
            srr.created_at,
            st.student_code,
            st.fullname AS student_name,
            sub.subject_name,
            cl.class_name,
            se.start_date AS semester_start_date,
            se.end_date AS semester_end_date,
            l.lecturer_id,
            l.fullname AS lecturer_name,
            sch.schedule_id,
            sch.day_of_week,
            sch.lesson_type,
            ls.slot_name,
            r.room_name,
            r.capacity,
            sh.shift_name,
            sch.start_time::time AS lesson_start,
            sch.end_time::time AS lesson_end
        FROM schedules AS sch
        JOIN subjects AS sub ON sub.subject_id = sch.subject_id_id
        JOIN classes AS cl ON cl.class_id = sch.class_id_id
        JOIN subject_registration_requests AS srr ON srr.schedule_id = sch.schedule_id
        JOIN lesson_slots AS ls ON ls.slot_id = sch.slot_id
        JOIN shifts AS sh ON sh.shift_id = ls.shift_id_id
        JOIN rooms AS r ON r.room_id = sch.room_id
        JOIN students AS st ON st.student_id = srr.student_id
        JOIN semesters AS se ON se.semester_id = srr.semester_id
        JOIN lecturer_subjects AS lsub ON lsub.subject_id = srr.subject_id
        JOIN lecturers AS l ON l.lecturer_id = lsub.lecturer_id
        WHERE st.student_code = %s
        AND sch.status = '1'
        AND sh.status = '1'
        AND sub.status = '1'
        AND cl.status = '1'
        AND r.status = '1'
        AND se.status = '1'
        ORDER BY sch.schedule_id;
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [student_code])
            columns = [col[0] for col in cursor.description]
            result = [dict(zip(columns, row)) for row in cursor.fetchall()]

        serializer = AdminScheduleManagementSerializer(result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# ADMIN: Get all student_code of student
# ==================================================
class GetAllStudentCodeView(APIView):
    """
    API to get all student_code of student
    """
    permission_classes = [IsAdminUser]
    def get(self, request):
        students = Student.objects.all()
        serializer = StudentCodeSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# ADMIN: Caculation total of student
# ==================================================
class TotalStudentView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        total = Student.objects.count()
        serializer = TotalStudentSerializer({'total_student': total})
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# ADMIN: Approve subject registration request
# ==================================================
class AdminApproveScheduleView(APIView):
    """
    Admin API for calendar review — update only:
    - reason
    - approved_by_id (auto-fetched from request.user)
    """
    permission_classes = [IsAdminUser]

    def put(self, request):
        request_ids = request.data.get("request_ids")
        reason = request.data.get("reason")

        if not request_ids or not isinstance(request_ids, list):
            return Response(
                {"error": "request_ids phải là danh sách các ID hợp lệ."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not reason:
            return Response(
                {"error": "Vui lòng nhập lý do duyệt."},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_count = SubjectRegistrationRequest.objects.filter(
            pk__in=request_ids
        ).update(
            status="approved",
            reason=reason,
            approved_by=request.user
        )

        return Response({
            "message": f"Đã cập nhật {updated_count} lịch học thành công.",
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)
# ==================================================
# ADMIN: Approve subject registration request
# ==================================================

# ==================================================
# Count subject registration request
# ==================================================
class CountSubjectRegistrationRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            account = Account.objects.prefetch_related('groups').get(account_id=account_id)
        except Account.DoesNotExist:
            return Response(
                {"detail": "Tài khoản không tồn tại."},
                status=status.HTTP_404_NOT_FOUND
            )

        is_student_role = account.groups.filter(name="student").exists()
        is_student_type = account.user_type == "student"

        if not (is_student_role and is_student_type):
            return Response(
                {"detail": "Bạn không có quyền truy cập tài nguyên này."},
                status=status.HTTP_403_FORBIDDEN
            )

        count_number_subject_registration = SubjectRegistrationRequest.objects.filter(
            student__account_id=account_id
        ).count()

        last_request = (
            SubjectRegistrationRequest.objects
            .filter(student__account_id=account_id)
            .order_by('-created_at')
            .first()
        )

        status_value = last_request.status if last_request else None

        serializer = CountSubjectRegistrationRequestSerializer({
            "count_number_subject_registration": count_number_subject_registration,
            "status": status_value
        })

        return Response(serializer.data, status=status.HTTP_200_OK)
    
