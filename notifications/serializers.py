from rest_framework import serializers
from .models import Notification, Reminder
from accounts.models import Account
from subjects.serializers import SubjectLeaveRequestSerializer

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
# ==================================================
# Return data for adding reminder function
# ==================================================
class ReminderSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    student_code = serializers.CharField()

    department_name = serializers.CharField(allow_null=True)

    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()
    class_id = serializers.IntegerField()
    class_name = serializers.CharField()
    lecturer_name = serializers.CharField(allow_null=True)
    schedule_id = serializers.IntegerField()
    day_of_week = serializers.IntegerField()
    slot_name = serializers.CharField()
    lesson_start = serializers.TimeField()
    lesson_end = serializers.TimeField()
    occurrence_start = serializers.DateTimeField()
    occurrence_end = serializers.DateTimeField()
    room_name = serializers.CharField()
    latitude = serializers.DecimalField(max_digits=10, decimal_places=5)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=5)
    lesson_type = serializers.CharField()
    repeat_weekly = serializers.CharField()
    semester_start_date = serializers.DateField()
    semester_end_date = serializers.DateField()
# ==================================================
# Save data for adding reminder
# ==================================================
class SaveReminderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Reminder
        fields = [
            'reminder_id', 'title', 'content',
            'start_date', 'end_date',
            'email_notification', 'time_reminder',
            'subject', 'student'
        ]

        read_only_fields = ['student']
# ==================================================
# Get all reminders of a student
# ==================================================
class ReminderListSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all())
    subject = SubjectLeaveRequestSerializer(read_only=True)
    class Meta:
        model = Reminder
        fields = [
            'reminder_id', 'title', 'content', 'start_date', 'end_date', 'time_reminder', 'status_reminder', 'email_notification',
            'student', 'subject'
        ]
# ==================================================
# Edit a reminder of a student
# ==================================================
class EditReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = [
            'reminder_id', 'title', 'content', 'start_date', 'end_date', 'time_reminder', 'status_reminder',
            'student', 'subject'
        ]
#TRANG

