from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Attendance
from students.models import Department, Student
from .serializers import (
    AttendanceSummarySerializer, AttendanceHistorySerializer, AttendanceStatisticSerializer,
    AttendanceStatisticTotalSerializer, AttendanceByDepartmentSerializer, AttendanceByDateSerializer, AttendanceByClassSerializer,
    AttendanceRecordSerializer, AttendanceStatusUpdateSerializer
)
from django.db.models import Count, Q, F
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from subjects.models import Semester, Subject
from django.utils import timezone
from django.db.models.functions import TruncDate
from datetime import timedelta
from classes.models import Class
from django.db import transaction
from lecturers.models import Lecturer, SubjectClass
from datetime import date

# ==================================================
# Display list attendance summary by account_id
# ==================================================
class AttendanceSummaryView(APIView):
    """
    Display list attendance summary by account_id
    URL: /attendance-summary/<int:account_id>/
    """
    def get(self, request, account_id):
        query = """
            SELECT
                COUNT(a.attendance_id) AS total_sessions,
                SUM(CASE WHEN a.status = 'P' AND a.is_late = '0' THEN 1 ELSE 0 END) AS present_on_time,
                SUM(CASE WHEN a.status = 'L' AND a.is_late = '1' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) AS absent_count,
                ROUND(
                    (CAST(SUM(CASE WHEN a.status IN ('P','L') THEN 1 ELSE 0 END) AS DECIMAL) 
                    / NULLIF(COUNT(a.attendance_id), 0)) * 100, 2
                ) AS attendance_rate_percent
            FROM students s
            LEFT JOIN attendances a 
                ON s.student_id = a.student_id
            JOIN accounts acc 
                ON acc.account_id = s.account_id
            WHERE acc.account_id = %s
            AND acc.is_locked = '0'
            AND acc.is_active = '1'
            AND s.status = '1'
            LIMIT 1;
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [account_id])  # pass account_id as a parameter to the query
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        results = [dict(zip(columns, row)) for row in rows]

        serializer = AttendanceSummarySerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Attendance history view
# ==================================================
class AttendanceHistoryView(APIView):
    """
    Display list attendance history by account_id
    URL: /attendance-history/<int:account_id>/
    """
    def get(self, request, account_id):
        query = """
        SELECT
            att.attendance_id,
            att.attendance_code,
            att.status,
            att.attendance_type,
            att.checkin_at,
            --
            sch.schedule_id,
            sch.day_of_week,
            --
            sub.subject_name,
            --
            cl.class_name,
            --
            r.room_name,
            --
            ls.slot_name,
            ls.start_time AS lesson_start_time,
            ls.end_time AS lesson_end_time,
            --
            sh.shift_name,
            --
            l.fullname
        FROM attendances AS att
        JOIN schedules AS sch
            ON sch.schedule_id = att.schedule_id
        JOIN subjects AS sub
            ON sub.subject_id = sch.subject_id_id
        JOIN students AS st 
            ON st.student_id = att.student_id
        JOIN accounts AS acc
            ON acc.account_id = st.account_id
        JOIN classes AS cl
            ON cl.class_id = sch.class_id_id
        JOIN rooms AS r
            ON r.room_id = sch.room_id
        JOIN lesson_slots AS ls
            ON ls.slot_id = sch.slot_id
        JOIN shifts AS sh
            ON sh.shift_id = ls.shift_id_id
        JOIN lecturer_subjects AS lsub
            ON lsub.subject_id = sch.subject_id_id
        JOIN lecturers AS l
            ON l.lecturer_id = lsub.lecturer_id
        WHERE acc.account_id = %s
            AND acc.is_locked = 'false'
            AND r.status = '1'
            AND sch.status = '1'
            AND sub.status = '1'
            AND st.status = '1'
            AND cl.status = '1'
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [account_id])  # pass account_id as a parameter to the query
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        results = [dict(zip(columns, row)) for row in rows]

        serializer = AttendanceHistorySerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Attendance statistics view
# ==================================================
class AttendanceStatisticView(APIView):
    """
    Get attendance statistics for a given account_id
    URL: /attendance-statistics/<int:account_id>/
    """
    def get(self, request, account_id):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    ss.subject_id,
                    sub.subject_name,
                    COUNT(a.attendance_id) AS total_sessions,
                    SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) AS present_sessions,
                    SUM(CASE WHEN a.status = 'L' THEN 1 ELSE 0 END) AS late_sessions,
                    SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) AS absent_sessions
                FROM students st
                JOIN subject_registration_requests ss 
                    ON st.student_id = ss.student_id 
                   AND ss.status = 'approved'
                JOIN subjects sub 
                    ON ss.subject_id = sub.subject_id
                LEFT JOIN schedules sch 
                    ON ss.subject_id = sch.subject_id_id
                LEFT JOIN attendances a 
                    ON a.schedule_id = sch.schedule_id 
                   AND a.student_id = st.student_id
                WHERE st.account_id = %s
                GROUP BY ss.subject_id, sub.subject_name
                ORDER BY sub.subject_name;
            """, [account_id])

            rows = cursor.fetchall()

        # convert rows to a list of dictionaries
        data = [
            {
                "subject_id": row[0],
                "subject_name": row[1],
                "total_sessions": row[2],
                "present_sessions": row[3],
                "late_sessions": row[4],
                "absent_sessions": row[5],
            }
            for row in rows
        ]

        serializer = AttendanceStatisticSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# AMIN: Caculation the total of attendance
# ==================================================
class AttendanceStatisticTotalView(APIView):
    permission_classes = [IsAdminUser]
    """
    Calculate the total number of attendance sessions, present sessions, late sessions, and absent sessions.
    URL: /admin/attendance-statistics-total/
    """
    def get(self, request):
        stats = Attendance.objects.aggregate(
            total_sessions=Count('attendance_id'),
            present_sessions=Count('attendance_id', filter=Q(status=Attendance.Status.PRESENT)),
            late_sessions=Count('attendance_id', filter=Q(status=Attendance.Status.LATE)),
            absent_sessions=Count('attendance_id', filter=Q(status=Attendance.Status.ABSENT)),
        )

        total = stats["total_sessions"] or 0
        if total > 0:
            stats["present_rate"] = round(stats["present_sessions"] / total * 100, 2)
            stats["late_rate"] = round(stats["late_sessions"] / total * 100, 2)
            stats["absent_rate"] = round(stats["absent_sessions"] / total * 100, 2)
            stats["total_sessions_precent"] = round(stats["present_rate"] + stats["late_rate"] / 100, 2)
        else:
            stats["present_rate"] = stats["late_rate"] = stats["absent_rate"] = 0.0

        serializer = AttendanceStatisticTotalSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# AMIN: Calulation the total of attendance session by each department
# ==================================================
class AttendanceStatisticByDepartmentView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, semester_id, academic_year_id):
        """
        Get attendance statistics grouped by department for a given semester and academic year.
        URL: /admin/attendance-statistics-by-department/<semester_id>/<academic_year_id>/
        """

        try:
            # FILTER:
            # Attendance.student -> Account
            # Account.student (OneToOne reverse) -> Student
            # Student.department -> Department
            # Schedule -> Class -> SubjectClass -> Semester -> AcademicYear
            departments = Department.objects.all().values("department_id", "department_name")

            # Query Attendance data filtered by semester + academic year
            queryset = Attendance.objects.select_related(
                "student", "student__student", "student__student__department",
                "schedule__class_id"
            ).filter(
                schedule__class_id__subject_classes__semester_id=semester_id,
                schedule__class_id__subject_classes__semester__academic_year_id=academic_year_id,
                student__student__isnull=False,  # avoid accounts without Student
            )

            # Aggregate attendance counts per department
            stats = (
                queryset
                .values(
                    department_id=F("student__student__department__department_id"),
                )
                .annotate(
                    total_sessions=Count("attendance_id"),
                    present_sessions=Count("attendance_id", filter=Q(status=Attendance.Status.PRESENT)),
                    late_sessions=Count("attendance_id", filter=Q(status=Attendance.Status.LATE)),
                    absent_sessions=Count("attendance_id", filter=Q(status=Attendance.Status.ABSENT)),
                )
            )

            # Convert queryset to dict for fast lookup
            stats_map = {item["department_id"]: item for item in stats}

            # Merge: ensure every department appears in final result
            result = []
            for dept in departments:
                d_id = dept["department_id"]
                stat = stats_map.get(d_id, None)
                total = stat["total_sessions"] if stat else 0
                present = stat["present_sessions"] if stat else 0
                late = stat["late_sessions"] if stat else 0
                absent = stat["absent_sessions"] if stat else 0

                result.append({
                    "department_id": d_id,
                    "department_name": dept["department_name"],
                    "total_sessions": total,
                    "present_sessions": present,
                    "late_sessions": late,
                    "absent_sessions": absent,
                    "present_rate": round(present / total * 100, 2) if total else 0.0,
                    "late_rate": round(late / total * 100, 2) if total else 0.0,
                    "absent_rate": round(absent / total * 100, 2) if total else 0.0,
                })

            # Serialize and return
            serializer = AttendanceByDepartmentSerializer(result, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ==================================================
# AMIN: Calulation the total of attendance session by day
# ==================================================
class AttendanceStatisticByDateCurrentSemesterView(APIView):
    """
    API to count attendance by day in the current semester.
    - Automatically get the current semester based on the system date.
    - Group data by day.
    - Only count sessions with status = 'P' (Present) or 'L' (Late).
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.now().date()

        # Get current active semester
        semester = Semester.objects.filter(
            start_date__lte=today,
            end_date__gte=today
        ).first()

        if not semester:
            return Response(
                {"detail": "No active semester found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate the last 7 days period (including today)
        start_date = today - timedelta(days=6)
        # Make sure the start date does not go before the semester start date
        start_date = max(start_date, semester.start_date)
        end_date = min(today, semester.end_date)

        # Filter attendances within the last 7 days and the current semester
        attendances = Attendance.objects.filter(
            schedule__start_time__date__gte=start_date,
            schedule__start_time__date__lte=end_date
        )

        # Group by date (truncate time to date only)
        grouped = (
            attendances
            .annotate(date=TruncDate('schedule__start_time'))
            .values('date')
            .annotate(attendance=Count('attendance_id'))
            .order_by('date')
        )

        # Ensure we return 7 days even if no attendance data (fill zeros)
        result = []
        for i in range(7):
            day = start_date + timedelta(days=i)
            found = next((g for g in grouped if g['date'] == day), None)
            result.append({
                "date": day.strftime("%d/%m/%Y"),
                "attendance": found["attendance"] if found else 0
            })

        serializer = AttendanceByDateSerializer(result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# AMIN: Calulation the total of attendance session by class
# ==================================================
class AttendanceStatisticByClassView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            # Optimize: select_related để giảm số query JOIN
            queryset = Attendance.objects.select_related("schedule__class_id")

            with transaction.atomic():
                queryset = queryset.only("status", "schedule__class_obj__class_name")

            # Group by class to calculate attendance counts
            grouped = (
                queryset.values(
                    class_id=F("schedule__class_id__class_id"),
                    class_name=F("schedule__class_id__class_name"),
                )
                .annotate(
                    total_sessions=Count("attendance_id"),
                    present_sessions=Count("attendance_id", filter=Q(status="P")),
                    late_sessions=Count("attendance_id", filter=Q(status="L")),
                    absent_sessions=Count("attendance_id", filter=Q(status="A")),
                )
                .order_by("class_name")
            )

            # Calculate percentages efficiently
            result = []
            for g in grouped:
                total = g["total_sessions"] or 0
                present = g["present_sessions"] or 0
                late = g["late_sessions"] or 0
                absent = g["absent_sessions"] or 0

                result.append({
                    "class_id": g["class_id"],
                    "class_name": g["class_name"],
                    "total_sessions": total,
                    "present_sessions": present,
                    "late_sessions": late,
                    "absent_sessions": absent,
                    "present_rate": round((present / total * 100), 2) if total > 0 else 0,
                    "late_rate": round((late / total * 100), 2) if total > 0 else 0,
                    "absent_rate": round((absent / total * 100), 2) if total > 0 else 0,
                })

            serializer = AttendanceByClassSerializer(result, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ==================================================
# IMPORT FOR LECTURER VIEWS
# ==================================================

from classes.minimal_serializers import ClassSerializer
from subjects.minimal_serializers import SubjectSerializer
from students.minimal_serializers import StudentSerializer

# ==================================================
# LECTURER: Calulation the total of attendance session by class
# ==================================================
class LecturerClassesView(APIView):
    """ Get classes taught by the lecturer """
    def get(self, request, account_id):
        try:
            lecturer = Lecturer.objects.filter(account_id=account_id).first()
            if not lecturer:
                return Response({"detail": "Giảng viên không tồn tại"}, status=404)

            classes = Class.objects.filter(
                subject_classes__lecturer=lecturer
            ).distinct()

            serializer = ClassSerializer(classes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LecturerClassSubjectsView(APIView):
    """ Get subjects taught by the lecturer in a specific class """
    def get(self, request, class_id, account_id):
        try:
            lecturer = Lecturer.objects.filter(account_id=account_id).first()
            if not lecturer:
                return Response({"detail": "Giảng viên không tồn tại"}, status=404)

            subjects = Subject.objects.filter(
                subject_classes__class_id_id=class_id,
                subject_classes__lecturer=lecturer
            ).distinct()

            serializer = SubjectSerializer(subjects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StudentsByClassSubjectView(APIView):
    """ Get students by class and subject taught by the lecturer """
    def get(self, request, class_id, subject_id, account_id):
        try:
            # Check if the lecturer is teaching the subject in the class
            if not SubjectClass.objects.filter(
                subject_id=subject_id,
                class_id_id=class_id,
                lecturer__account_id=account_id
            ).exists():
                return Response({"detail": "Giảng viên không dạy môn này trong lớp"}, status=400)

            # Get students enrolled in the subject and class
            students = Student.objects.filter(
                studentsubject__subject_id=subject_id,
                class_students__class_id=class_id
            ).distinct().order_by('fullname')

            serializer = StudentSerializer(students, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ====================================================
# LECTURER: DASHBOARD STATISTICS VIEW
# ====================================================

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from attendance.models import Attendance
from students.models import Student
from subjects.models import Subject
from classes.models import Class

@api_view(["GET"])
def lecturer_dashboard_statistics(request):
    """ Get dashboard statistics for lecturer """
    class_id = request.GET.get("class_id")
    subject_id = request.GET.get("subject_id")

    if not class_id or not subject_id:
        return Response({"detail": "Thiếu class_id hoặc subject_id"}, status=400)

    try:
        total_attendance = Attendance.objects.filter(
            schedule__subject_id=subject_id,
            schedule__class_id=class_id
        ).count()

        total_present = Attendance.objects.filter(
            schedule__subject_id=subject_id,
            schedule__class_id=class_id,
            status="P"
        ).count()

        total_absent = Attendance.objects.filter(
            schedule__subject_id=subject_id,
            schedule__class_id=class_id,
            status="A"
        ).count()

        data = {
            "totalAttendance": total_attendance,
            "totalPresent": total_present,
            "totalAbsent": total_absent,
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from lecturers.models import SubjectClass
from leaves.models import LeaveRequest


class LeaveRequestStatsView(APIView):
    """
    Get leave request statistics for a specific class and subject taught by the lecturer.
    Returns the count of leave requests in different statuses: Pending, Approved, Rejected.
    """

    def get(self, request, class_id, subject_id, account_id):
        try:
            # Check if the lecturer is teaching the subject in the class
            if not SubjectClass.objects.filter(
                subject_id=subject_id,
                class_id_id=class_id,
                lecturer__account_id=account_id
            ).exists():
                return Response(
                    {"detail": "Giảng viên không dạy môn này trong lớp"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get leave requests for the specified class and subject
            leave_requests = LeaveRequest.objects.filter(
                subject_id=subject_id,
                student__class_students__class_id=class_id
            )

            # Count leave requests in different statuses
            pending_requests = leave_requests.filter(status='P').count()  # Pending
            approved_requests = leave_requests.filter(status='A').count()
            rejected_requests = leave_requests.filter(status='R').count()

            # Prepare response data
            data = {
                "pending_requests": pending_requests,
                "approved_requests": approved_requests,
                "rejected_requests": rejected_requests,
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class LeavePieStatsView(APIView):
    """
    Statistics of leave requests by class and subject (for pie chart)
    Returns the count of each status: Pending / Approved / Rejected
    """
    def get(self, request, class_id, subject_id, account_id):
        try:
            if not SubjectClass.objects.filter(
                class_id_id=class_id,
                subject_id=subject_id,
                lecturer__account_id=account_id
            ).exists():
                return Response({"detail": "Giảng viên không dạy lớp này"}, status=400)

            leave_requests = LeaveRequest.objects.filter(
                subject_id=subject_id,
                student__class_students__class_id=class_id
            )

            data = {
                "pending": leave_requests.filter(status="P").count(),
                "approved": leave_requests.filter(status="A").count(),
                "rejected": leave_requests.filter(status="R").count(),
            }
            return Response(data, status=200)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from leaves.models import LeaveRequest
from lecturers.models import SubjectClass

class LeavePieStatsView(APIView):
    """
    Statistics of leave requests by class and subject (for pie chart)
    Returns the count of each status: Pending / Approved / Rejected
    """
    def get(self, request, class_id, subject_id, account_id):
        try:
            if not SubjectClass.objects.filter(
                class_id_id=class_id,
                subject_id=subject_id,
                lecturer__account_id=account_id
            ).exists():
                return Response({"detail": "Giảng viên không dạy lớp này"}, status=400)

            leave_requests = LeaveRequest.objects.filter(
                subject_id=subject_id,
                student__class_students__class_id=class_id
            )

            data = {
                "pending": leave_requests.filter(status="P").count(),
                "approved": leave_requests.filter(status="A").count(),
                "rejected": leave_requests.filter(status="R").count(),
            }
            return Response(data, status=200)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)
        
# ====================================================
# GET CLASS, SUBJECT, LECTURER INFO FOR EXCEL EXPORT
# ====================================================
@api_view(["GET"])
def get_class_info(request, class_id):
    try:
        cls = Class.objects.get(pk=class_id)
        return Response({"class_name": cls.class_name}, status=200)
    except Class.DoesNotExist:
        return Response({"detail": "Không tìm thấy lớp"}, status=404)


@api_view(["GET"])
def get_subject_info(request, subject_id):
    try:
        subject = Subject.objects.get(pk=subject_id)
        return Response({"subject_name": subject.subject_name}, status=200)
    except Subject.DoesNotExist:
        return Response({"detail": "Không tìm thấy môn học"}, status=404)


@api_view(["GET"])
def get_lecturer_by_account(request, account_id):
    try:
        lecturer = Lecturer.objects.get(account_id=account_id)
        return Response({"fullname": lecturer.fullname}, status=200)
    except Lecturer.DoesNotExist:
        return Response({"detail": "Không tìm thấy giảng viên"}, status=404)

# ====================================================
# LECTURER: Statistics of attendance by lecturer
# ====================================================
class AttendanceByLecturerView(APIView):

    def get(self, request):
        subject_id = request.query_params.get("subject_id")
        class_id = request.query_params.get("class_id")
        account_id = request.query_params.get("account_id")
        selected_date = request.query_params.get("date")  # optional

        if not subject_id or not class_id or not account_id:
            return Response({"error": "subject_id, class_id, account_id are required"}, status=400)

        # Nếu date không có → lấy today
        if selected_date is None:
            selected_date = date.today().strftime("%Y-%m-%d")

        query = """
            SELECT
                a.attendance_id,
                a.attendance_code AS code,
                a.status AS attendance_status,
                a.attendance_type,
                a.checkin_at,
                st.student_code,
                st.fullname,
                sub.subject_name,
                sub.subject_id,
                cl.class_name,
                cl.class_id,
                sh.schedule_id,
                sh.start_time
            FROM attendances a
            JOIN students st ON st.student_id = a.student_id
            JOIN schedules sh ON sh.schedule_id = a.schedule_id
            JOIN subjects sub ON sub.subject_id = sh.subject_id_id
            JOIN classes cl  ON cl.class_id   = sh.class_id_id
            JOIN lecturer_subjects ls ON ls.subject_id = sub.subject_id
            JOIN lecturers le ON le.lecturer_id = ls.lecturer_id
            WHERE sub.subject_id = %s
              AND cl.class_id    = %s
              AND le.account_id  = %s
              AND a.checkin_at >= %s::date
              AND a.checkin_at <  (%s::date + INTERVAL '1 day')
            ORDER BY st.student_code, a.checkin_at DESC;
        """

        params = [
            subject_id,
            class_id,
            account_id,
            selected_date,
            selected_date,
        ]

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            rows = cursor.fetchall()

        columns = [
            "attendance_id",
            "code",
            "attendance_status",
            "attendance_type",
            "checkin_at",
            "student_code",
            "fullname",
            "subject_name",
            "subject_id",
            "class_name",
            "class_id",
            "schedule_id",
            "start_time",
        ]

        results = [dict(zip(columns, row)) for row in rows]

        serializer = AttendanceRecordSerializer(results, many=True)
        return Response(serializer.data)
# ====================================================
# LECTURER: Update status of attendance
# ====================================================
class AttendanceStatusUpdateView(APIView):
    def patch(self, request, attendance_id):
        try:
            attendance = Attendance.objects.get(attendance_id=attendance_id)
        except Attendance.DoesNotExist:
            return Response({"error": "Attendance not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AttendanceStatusUpdateSerializer(attendance, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Cập nhật thành công", "data": serializer.data}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)