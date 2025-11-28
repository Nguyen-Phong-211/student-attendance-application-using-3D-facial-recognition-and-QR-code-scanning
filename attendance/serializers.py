from rest_framework import serializers

# ==================================================
# Display list attendance summary by account_id
# ==================================================
class AttendanceSummarySerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    present_on_time = serializers.IntegerField()
    late_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()
    attendance_rate_percent = serializers.DecimalField(max_digits=5, decimal_places=2)
# ==================================================
# Attendance history serializer
# ==================================================
class AttendanceHistorySerializer(serializers.Serializer):
    attendance_id = serializers.IntegerField()
    attendance_code = serializers.UUIDField()
    status = serializers.CharField()
    attendance_type = serializers.CharField()
    checkin_at = serializers.DateTimeField()
    schedule_id = serializers.IntegerField()
    day_of_week = serializers.IntegerField()
    subject_name = serializers.CharField()
    class_name = serializers.CharField()
    room_name = serializers.CharField()
    slot_name = serializers.CharField()
    lesson_start_time = serializers.TimeField()
    lesson_end_time = serializers.TimeField()
    shift_name = serializers.CharField()
    fullname = serializers.CharField()
# ==================================================
# Attendance statistics serializer (Bar chart)
# ==================================================
class AttendanceStatisticSerializer(serializers.Serializer):
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()
    total_sessions = serializers.IntegerField()
    present_sessions = serializers.IntegerField()
    late_sessions = serializers.IntegerField()
    absent_sessions = serializers.IntegerField()
# ==================================================
# AMIN: Calulation the total of attendance session
# ==================================================
class AttendanceStatisticTotalSerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    total_sessions_precent = serializers.DecimalField(max_digits=5, decimal_places=2)

    # present_sessions = serializers.IntegerField()
    # late_sessions = serializers.IntegerField()
    # absent_sessions = serializers.IntegerField()

    present_rate = serializers.FloatField()
    late_rate = serializers.FloatField()
    absent_rate = serializers.FloatField()
# ==================================================
# AMIN: Calulation the total of attendance session by each department
# ==================================================
class AttendanceByDepartmentSerializer(serializers.Serializer):
    department_id = serializers.IntegerField()
    department_name = serializers.CharField()
    present_sessions = serializers.IntegerField()
    late_sessions = serializers.IntegerField()
    absent_sessions = serializers.IntegerField()
    total_sessions = serializers.IntegerField()
    present_rate = serializers.FloatField()
    late_rate = serializers.FloatField()
    absent_rate = serializers.FloatField()
# ==================================================
# AMIN: Calulation the total of attendance session by day
# ==================================================
class AttendanceByDateSerializer(serializers.Serializer):
    date = serializers.CharField()
    attendance = serializers.IntegerField()
# ==================================================
# AMIN: Calulation the total of attendance session by class
# ==================================================
class AttendanceByClassSerializer(serializers.Serializer):
    class_id = serializers.IntegerField()
    class_name = serializers.CharField()
    total_sessions = serializers.IntegerField()
    present_sessions = serializers.IntegerField()
    late_sessions = serializers.IntegerField()
    absent_sessions = serializers.IntegerField()
    present_rate = serializers.FloatField()
    late_rate = serializers.FloatField()
    absent_rate = serializers.FloatField()
# ==================================================
# LECTURER: Statistics of attendance by lecturer
# ==================================================
class AttendanceRecordSerializer(serializers.Serializer):
    attendance_id = serializers.IntegerField()
    code = serializers.CharField()
    attendance_status = serializers.CharField()
    attendance_type = serializers.CharField()
    checkin_at = serializers.DateTimeField()

    student_code = serializers.CharField()
    fullname = serializers.CharField()

    subject_name = serializers.CharField()
    subject_id = serializers.IntegerField()

    class_name = serializers.CharField()
    class_id = serializers.IntegerField()

    schedule_id = serializers.IntegerField()
    start_time = serializers.DateTimeField()
# ==================================================
# LECTURER: Update status of attendance
# ==================================================
class AttendanceStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[("P", "Present"), ("A", "Absent"), ("L", "Late")],
        required=True
    )

    def update(self, instance, validated_data):
        instance.status = validated_data["status"]
        instance.save()
        return instance