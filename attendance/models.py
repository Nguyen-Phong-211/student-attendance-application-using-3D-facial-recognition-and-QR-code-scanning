from django.db import models
from classes.models import Schedule
from students.models import Student
from students.models import Device
from lecturers.models import Lecturer


class Attendance(models.Model):
    attendance_id = models.BigAutoField(primary_key=True)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    status = models.CharField(max_length=1)
    checkin_time = models.TimeField(auto_now_add=True)
    face_image_url = models.TextField()
    verified_by_ai = models.CharField(max_length=1)
    checkin_lat = models.DecimalField(max_digits=10, decimal_places=5)
    checkin_long = models.DecimalField(max_digits=10, decimal_places=5)
    checkin_device = models.ForeignKey(Device, on_delete=models.CASCADE)
    note = models.TextField(null=True)
    attendance_type = models.CharField(max_length=1)
    is_late = models.CharField(max_length=1)
    late_reason = models.TextField(null=True)
    checkin_method = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendances'
        indexes = [
            models.Index(fields=['schedule_id']),
            models.Index(fields=['student_id']),
            models.Index(fields=['checkin_device_id']),
        ]
        managed = True
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendances'

    def __str__(self):
        return self.attendance_id

class AttendanceVerification(models.Model):
    verification_id = models.BigAutoField(primary_key=True)
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE)
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE)
    verified_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=1, default='1')
    note = models.TextField(null=True)

    class Meta:
        db_table = 'attendance_verifications'
        indexes = [
            models.Index(fields=['attendance_id']),
            models.Index(fields=['lecturer_id']),
        ]
        managed = True
        verbose_name = 'Attendance Verification'
        verbose_name_plural = 'Attendance Verifications'

    def __str__(self):
        return self.verification_id
    
class FaceRecognitionLog(models.Model):
    face_recognition_log_id = models.BigAutoField(primary_key=True)
    student = models.CharField(max_length=255)
    face_embedding = models.BinaryField()
    face_image_url = models.TextField()
    confidence_score = models.DecimalField(max_digits=10, decimal_places=5)
    attendace = models.ForeignKey("attendance.Attendance", on_delete=models.CASCADE)
    note = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'face_recognition_logs'
        indexes = [
            models.Index(fields=['attendace_id'])
        ]
        managed = True
        verbose_name = 'Face Recognition Log'
        verbose_name_plural = 'Face Recognition Logs'

    def __str__(self):
        return self.student_id
    
class QRCheckin(models.Model):
    qr_checkin_id = models.BigAutoField(primary_key=True)
    qr_code = models.CharField(max_length=255)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    expire_at = models.TimeField(auto_now_add=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(Lecturer, on_delete=models.CASCADE)
    is_active = models.CharField(max_length=1)
    usage_count = models.IntegerField()
    max_usage = models.IntegerField()
    radius = models.IntegerField()
    latitude = models.DecimalField(max_digits=10, decimal_places=5)
    longitude = models.DecimalField(max_digits=10, decimal_places=5)
    used_by_student = models.ForeignKey(Student, on_delete=models.CASCADE)

    class Meta:
        db_table = 'qr_checkins'
        indexes = [
            models.Index(fields=['schedule_id']),
            models.Index(fields=['created_by']),
            models.Index(fields=['used_by_student_id']),
        ]
        managed = True
        verbose_name = 'QR Checkin'
        verbose_name_plural = 'QR Checkins'

    def __str__(self):
        return f"{self.class_id} - {self.student_id}"



