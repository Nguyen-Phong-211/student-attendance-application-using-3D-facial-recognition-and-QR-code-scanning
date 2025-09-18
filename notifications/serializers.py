from rest_framework import serializers
from .models import Notification, Reminder

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
# ==================================================
# Return data for adding reminder function
# ==================================================
class ReminderSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    fullname = serializers.CharField()
    student_code = serializers.CharField()
    department_name = serializers.CharField(allow_null=True)

    class_id = serializers.IntegerField()
    class_name = serializers.CharField()
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()

    lecturer_name = serializers.CharField(allow_null=True)
    lecturer_id = serializers.IntegerField(allow_null=True)

    academic_year_id = serializers.IntegerField()
    academic_year_name = serializers.CharField()
    semester_id = serializers.IntegerField()
    semester_name = serializers.CharField()
    start_date_semester = serializers.DateField()
    end_date_semester = serializers.DateField()

    schedule_id = serializers.IntegerField()
    day_of_week = serializers.IntegerField()
    room_id = serializers.IntegerField()
    room_name = serializers.CharField()
    slot_id = serializers.IntegerField()
    slot_name = serializers.CharField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    max_leave_days = serializers.IntegerField()
# ==================================================
# Save data for adding reminder
# ==================================================
class SaveReminderSerializer(serializers.ModelSerializer):
    student_account = serializers.IntegerField(write_only=True)

    class Meta:
        model = Reminder
        fields = [
            'reminder_id', 'title', 'content',
            'start_date', 'end_date',
            'email_notification', 'time_reminder',
            'subject', 'student'
        ]

    def create(self, validated_data):
        account_id = validated_data.pop("student_account")
        student = Student.objects.get(account_id=account_id)
        validated_data["student"] = student
        return super().create(validated_data)