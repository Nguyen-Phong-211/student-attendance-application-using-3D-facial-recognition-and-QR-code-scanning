from rest_framework import generics, permissions, viewsets
from .models import Notification, Reminder
from .serializers import NotificationSerializer, ReminderSerializer, SaveReminderSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import connection
from rest_framework.views import APIView
from rest_framework import status
from students.models import Student

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
        account_id = self.request.user.account_id
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

    return Response({"status": "success"})

# ==================================================
# Return data for adding reminder function
# ==================================================
class ReminderRawView(APIView):
    """
    API Gets data for add reminder function using raw SQL query
    """
    def get(self, request, account_id, subject_id, academic_year_id, semester_id):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    WITH students_cte AS 
                    ( 
                        SELECT 
                            st.student_code, 
                            st.fullname, 
                            d.department_name, 
                            st.student_id 
                        FROM students AS st 
                        JOIN departments AS d 
                            ON st.department_id = d.department_id 
                        JOIN accounts AS acc 
                            ON acc.account_id = st.account_id
                        WHERE acc.account_id = %s
                    ), 
                    class_cte AS 
                    ( 
                        SELECT 
                            cl.class_name, 
                            cl.class_id, 
                            sub.subject_name, 
                            sub.subject_id, 
                            le.fullname AS lecturer_name, 
                            le.lecturer_id, 
                            cl.academic_year_id, 
                            ay.academic_year_name,
                            se.semester_id,
                            se.semester_name,
                            se.start_date AS start_date_semester,
		                    se.end_date AS end_date_semester,
                            sch.schedule_id,
                            sch.day_of_week,
                            r.room_id,
                            r.room_name,
                            ls.slot_id,
                            ls.slot_name,
                            ls.start_time,
	                        ls.end_time,
                            stsu.max_leave_days
                        FROM classes AS cl 
                        JOIN class_students AS cs 
                            ON cl.class_id = cs.class_id_id 
                        JOIN subject_classes AS sc 
                            ON sc.class_id_id = cl.class_id 
                        JOIN subjects AS sub 
                            ON sub.subject_id = sc.subject_id 
                        JOIN lecturers AS le 
                            ON le.lecturer_id = sc.lecturer_id 
                        JOIN semesters AS se 
                            ON se.academic_year_id = cl.academic_year_id 
                        JOIN academic_years ay 
	                        ON ay.academic_year_id = se.academic_year_id
                        JOIN schedules AS sch 
                            ON sch.class_id_id = cl.class_id
                        JOIN rooms AS r 
                            ON r.room_id = sch.room_id
                        JOIN lesson_slots ls 
                            ON ls.slot_id = sch.slot_id 
                        JOIN student_subjects AS stsu
	                        ON stsu.subject_id = sub.subject_id AND stsu.student_id = cs.student_id
                        WHERE sub.status = '1' 
                            AND cl.status = '1' 
                            AND cl.academic_year_id = %s
                            AND se.semester_id = %s
                            AND sch.status = '1'
                            AND r.status = '1'
                    ) 
                        SELECT DISTINCT ON (s.student_id) 
                            s.student_id, 
                            s.fullname, 
                            s.student_code, 
                            s.department_name, 
                            c.class_name, 
                            c.subject_name, 
                            c.lecturer_id,
                            c.lecturer_name, 
                            c.class_id, 
                            c.subject_id, 
                            c.academic_year_id, 
                            c.academic_year_name,
                            c.semester_id,
                            c.semester_name,
                            c.start_date_semester,
		                    c.end_date_semester,
                            c.day_of_week,
                            c.schedule_id,
                            c.room_id,
                            c.room_name,
                            c.slot_id,
                            c.slot_name,
                            c.start_time,
	                        c.end_time,
                            c.max_leave_days
                        FROM students_cte s 
                            JOIN class_cte c 
                                ON c.class_id IN 
                                ( 
                                SELECT cs.class_id_id 
                                FROM class_students cs 
                                JOIN students st
                                    ON st.student_id = cs.student_id
                                JOIN accounts acc
                                    ON acc.account_id = st.account_id
                                WHERE acc.account_id = %s 
                                    AND c.subject_id = %s
                                    AND acc.is_locked = false
                                    AND st.status = '1'
                                );
                """, [account_id, academic_year_id, semester_id, account_id, subject_id])

                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]

            serializer = ReminderSerializer(results, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ==================================================
# Save reminder data
# ==================================================
class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all().order_by('-created_at')
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        When creating a new reminder, get the student and save it.
        """
        account = self.request.user
        try:
            student = Student.objects.get(account=account)
        except Student.DoesNotExist:
            student = None

        serializer.save(student=student)

    def get_queryset(self):
        """
        Only return reminders for the authenticated user's student.
        """
        account = self.request.user
        try:
            student = Student.objects.get(account=account)
            return Reminder.objects.filter(student=student).order_by('-created_at')
        except Student.DoesNotExist:
            return Reminder.objects.none()
