from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from students.models import Student, StudentSubject
from classes.models import ClassStudent
from .serializers import (
    LeaveRequestSerializer, SaveLeaveRequestSerializer, ListSubjectLeaveRequestSerializer, LecturerLeaveRequestSerializer
)
from lecturers.models import SubjectClass
from classes.models import Schedule
from django.db import connection
from rest_framework import viewsets
from .models import LeaveRequest
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from lecturers.models import Lecturer
from subjects.models import Semester

# ==================================================
# Class LeaveRequestView
# ==================================================
class LeaveRequestRawView(APIView):
    """
    API Gets leave request data using raw SQL query
    """
    def get(self, request, account_id, subject_id):
        try:
            with connection.cursor() as cursor:
                query = """
                WITH week AS (
                        SELECT date_trunc('week', CURRENT_DATE)::date AS week_start
                    )
                    SELECT DISTINCT ON (sch.schedule_id)
                        st.student_id,
                        st.student_code,
                        st.fullname AS student_name,

                        d.department_name,

                        sub.subject_id,
                        sub.subject_name,

                        cl.class_id,
                        cl.class_name,

                        ay.academic_year_id,
                        ay.academic_year_name,

                        se.semester_id,
                        se.semester_name,
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
                    JOIN academic_years AS ay ON ay.academic_year_id = se.academic_year_id
                    JOIN lecturer_subjects AS lsub ON lsub.subject_id = srr.subject_id
                    JOIN lecturers AS l ON l.lecturer_id = lsub.lecturer_id
                    JOIN student_subjects AS ss ON ss.subject_registration_request_id = srr.subject_registration_request_id
                    JOIN departments AS d ON d.department_id = st.department_id
                    JOIN accounts AS acc ON acc.account_id = st.account_id
                    CROSS JOIN week w
                    WHERE srr.status = 'approved'
                    AND acc.account_id = %s
                    AND sub.subject_id = %s
                    AND sch.status = '1'
                    AND sh.status = '1'
                    AND sub.status = '1'
                    AND cl.status = '1'
                    AND r.status = '1'
                    AND se.status = '1'
                    ORDER BY sch.schedule_id, occurrence_start;
                """

                cursor.execute(query, [account_id, subject_id])

                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]

            serializer = LeaveRequestSerializer(results, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
# ==================================================
# Class LeaveRequestView
# ==================================================
class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = SaveLeaveRequestSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
# ==================================================
# List subjects leave request view
# ==================================================
class ListSubjectsLeaveRequestView(APIView):
    def get(self, request, account_id):
        try:
            with connection.cursor() as cursor:
                query = """
                SELECT lr.leave_request_id,
                    lr.leave_request_code,
                    lr.reason,
                    lr.from_date,
                    lr.to_date,
                    lr.status AS leave_request_status,
                    lr.rejected_reason,
                    lr.attachment,
                    lr.images_urls,
                    sub.subject_name,
                    MAX(ss.max_leave_days) AS max_leave_days
                FROM leave_requests AS lr
                JOIN subjects AS sub
                ON sub.subject_id = lr.subject_id
                JOIN students AS st
                ON st.student_id = lr.student_id
                LEFT JOIN accounts AS acc 
                ON acc.account_id = st.account_id
                LEFT JOIN student_subjects AS ss
                ON ss.subject_id = sub.subject_id
                AND ss.student_id = st.student_id
                WHERE acc.account_id = %s
                AND sub.status = '1'
                GROUP BY lr.leave_request_id,
                        lr.leave_request_code,
                        lr.reason,
                        lr.from_date,
                        lr.to_date,
                        lr.status,
                        lr.rejected_reason,
                        lr.attachment,
                        lr.images_urls,
                        sub.subject_name
                ORDER BY lr.leave_request_id DESC;
                """
                cursor.execute(query, [account_id])

                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]

            serializer = ListSubjectLeaveRequestSerializer(results, many=True, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
# ==================================================
# LECTURER: GET LIST LEAVE REQUEST
# ==================================================
class LecturerReceivedLeaveRequestsView(APIView):
    def get(self, request, lecturer_id):
        try:
            with connection.cursor() as cursor:
                query = """
                SELECT 
                    lr.leave_request_id,
                    lr.leave_request_code,
                    lr.reason,
                    lr.from_date,
                    lr.to_date,
                    lr.status,
                    lr.rejected_reason,
                    lr.attachment,
                    lr.reviewed_at,
                    lr.images_urls,
                    lr.created_at,
                    st.student_id,
                    st.student_code,
                    st.fullname,
                    sub.subject_name,
                    MAX(ss.max_leave_days) AS max_leave_days,
                    cl.class_name,
                    cl.class_id
                FROM leave_requests lr
                JOIN lecturers le ON le.lecturer_id = lr.to_target_id
                JOIN accounts acc ON acc.account_id = le.account_id
                JOIN students st ON st.student_id = lr.student_id
                JOIN subjects sub ON sub.subject_id = lr.subject_id
                JOIN student_subjects ss 
                    ON ss.subject_id = lr.subject_id
                AND ss.student_id = lr.student_id
                JOIN subject_classes sc 
                    ON sc.subject_id = lr.subject_id 
                AND sc.lecturer_id = le.lecturer_id
                JOIN classes cl ON cl.class_id = sc.class_id_id
                WHERE acc.account_id = %s
                GROUP BY lr.leave_request_id, lr.leave_request_code, lr.reason, lr.from_date, lr.to_date,
                        lr.status, lr.rejected_reason, lr.attachment, lr.reviewed_at, lr.images_urls, lr.created_at,
                        st.student_id, st.student_code, st.fullname, sub.subject_name, cl.class_name, cl.class_id
                ORDER BY lr.created_at DESC;
                """

                cursor.execute(query, [lecturer_id])
                columns = [col[0] for col in cursor.description]
                raw_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            serializer = LecturerLeaveRequestSerializer(
                raw_data, 
                many=True, 
                context={"request": request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def approve_leave_request(request, pk):
    lr = get_object_or_404(LeaveRequest, pk=pk)
    lecturer = get_object_or_404(Lecturer, account=request.user)

    # Lấy bản ghi StudentSubject của kỳ hiện tại
    student_subject = StudentSubject.objects.filter(
        student=lr.student,
        subject=lr.subject,
    ).first()

    if not student_subject:
        return Response({'error': 'Không tìm thấy StudentSubject cho môn học này'}, status=400)

    if student_subject.max_leave_days <= 0:
        return Response({'error': 'Sinh viên đã hết ngày nghỉ phép'}, status=400)

    # Duyệt đơn
    lr.status = 'A'
    lr.reviewed_at = now()
    lr.approved_by = lecturer
    lr.save()

    # Trừ 1 ngày phép
    student_subject.max_leave_days -= 1
    student_subject.save()

    return Response({'success': True, 'remaining_leave_days': student_subject.max_leave_days})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def reject_leave_request(request, pk):
    lr = get_object_or_404(LeaveRequest, pk=pk)
    lecturer = get_object_or_404(Lecturer, account=request.user)

    lr.status = 'R'
    lr.rejected_reason = request.data.get('rejected_reason', '')
    lr.reviewed_at = now()
    lr.approved_by = lecturer
    lr.save()
    return Response({'success': True})