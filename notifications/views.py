from rest_framework import generics, permissions, viewsets
from .models import Notification, Reminder
from .serializers import NotificationSerializer, ReminderSerializer, SaveReminderSerializer, ReminderListSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import connection
from rest_framework.views import APIView
from rest_framework import status
from students.models import Student
import datetime
from django.utils.timezone import now
from .tasks import send_reminder_email
from rest_framework import serializers
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from notifications.utils import send_notification 
#TRANG
# from notifications.models import Notification
# from notifications.utils import send_notification

# ==================================================
# Display list notifications by account_id
# ==================================================
class UserNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        account_id = self.kwargs.get("account_id")
        return Notification.objects.filter(to_target_id=account_id).order_by("-created_at")

# ==================================================
# Filter notifications (not read) by account_id
# ==================================================
class UnreadNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Cho phép đọc thông báo theo account_id trên URL
        account_id = self.kwargs.get("account_id", self.request.user.account_id)
        return (
            Notification.objects
            .filter(to_target_id=account_id, is_read='0')
            .order_by('-created_at')
        )

# ==================================================
# Filter notifications (read) by account_id
# ==================================================
class ReadNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        account_id = self.request.user.account_id
        return (
            Notification.objects
            .filter(to_target_id=account_id, is_read='1')
            .order_by('-created_at')
        )

# ==================================================
# Mark notifications as read
# ==================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_as_read(request, account_id):
    if account_id != request.user.account_id:
        return Response({"error": "Permission denied"}, status=403)

    ids = request.data.get("notification_id", [])

    if isinstance(ids, int):
        ids = [ids]

    Notification.objects.filter(
        pk__in=ids,
        to_target_id=account_id
    ).update(is_read='1')

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{account_id}",
        {
            "type": "send_read_update",
            "content": {
                "ids": ids,
                "unread_count": Notification.objects.filter(
                    to_target_id=account_id, is_read='0'
                ).count()
            }
        }
    )

    return Response({"status": "success"})

# ==================================================
# Return data for adding reminder function
# ==================================================
class ReminderRawView(APIView):
    """
    API Gets data for add reminder function using raw SQL query
    """
    def get(self, request, account_id, subject_id):
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
        CROSS JOIN week w
        WHERE srr.status = 'approved'
        AND srr.student_id = %s
        AND sub.subject_id = %s
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
            cursor.execute(query, [student_id, subject_id])
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # 3. Serialize the returned data
        serializer = ReminderSerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ==================================================
# Save reminder data
# ==================================================
class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all().order_by('-created_at')
    serializer_class = SaveReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        When creating a new reminder, get the student and save it.
        """
        account = self.request.user
        student = Student.objects.filter(account=account).first()
        if not student:
            raise serializers.ValidationError("No student found for this account.")
        
        reminder = serializer.save(student=student)

        """Get subject_id, student_id in Reminder model."""
        subject_id = reminder.subject_id
        student_id = student.student_id
        student_email = account.email 

        # Caculate time sending email before end_date
        if reminder.end_date:
            times = [
                ("1h", reminder.end_date - datetime.timedelta(hours=1)),
                ("30m", reminder.end_date - datetime.timedelta(minutes=30)),
            ]
        else:
            # fallback test case
            times = [
                ("1h", now() + datetime.timedelta(minutes=1)),
                ("30m", now() + datetime.timedelta(minutes=2)),
            ]

        # Create task
        for when, send_time in times:
            if send_time > now():
                send_reminder_email.apply_async(
                    args=[student_id, subject_id, student_email, when],
                    eta=send_time
                )

    def get_queryset(self):
        """
        Only return reminders for the authenticated user's student.
        """
        account = self.request.user
        student = Student.objects.filter(account=account).first()
        return Reminder.objects.filter(student=student).order_by('-created_at') if student else Reminder.objects.none()
# ==================================================
# Get all reminders of a student
# ==================================================
class ReminderListView(generics.ListAPIView):
    serializer_class = ReminderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        account = self.request.user
        student = Student.objects.filter(account=account).first()
        return Reminder.objects.filter(student=student, status_reminder='P').order_by('-created_at') if student else Reminder.objects.none()
    


