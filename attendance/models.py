from django.db import models
from classes.models import Schedule
from students.models import Student, Device
from lecturers.models import Lecturer
from django.utils import timezone

# ==============================
# ATTENDANCE MODEL
# ==============================
class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = "P", "Có mặt"
        ABSENT = "A", "Vắng"
        LATE = "L", "Đi muộn"

    class AttendanceType(models.TextChoices):
        FACE = "F", "Nhận diện khuôn mặt"
        QR = "Q", "Quét QR"

    attendance_id = models.BigAutoField(primary_key=True)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    status = models.CharField(max_length=1, choices=Status.choices, default=Status.PRESENT)
    attendance_type = models.CharField(max_length=1, choices=AttendanceType.choices)
    checkin_at = models.TimeField(auto_now_add=False, null=True)# models.Ti(auto_now_add=True)
    face_image_url = models.TextField(null=True, blank=True)
    verified_by_ai = models.BooleanField(default=False)
    checkin_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    checkin_long = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    checkin_device = models.ForeignKey(Device, on_delete=models.SET_NULL, null=True, blank=True)
    is_late = models.BooleanField(default=False)
    late_reason = models.TextField(null=True, blank=True)
    checkin_method = models.CharField(max_length=20, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendances'
        indexes = [
            models.Index(fields=['schedule', 'student']),
            models.Index(fields=['checkin_device']),
        ]
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendances'

    def __str__(self):
        return f"{self.student.fullname} - {self.schedule}"


# ==============================
# ATTENDANCE VERIFICATION MODEL
# ==============================
class AttendanceVerification(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = "P", "Chờ xác nhận"
        APPROVED = "A", "Đã xác nhận"
        REJECTED = "R", "Từ chối"

    verification_id = models.BigAutoField(primary_key=True)
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE)
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE)
    verified_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=1, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    note = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'attendance_verifications'
        indexes = [
            models.Index(fields=['attendance', 'lecturer']),
        ]
        verbose_name = 'Attendance Verification'
        verbose_name_plural = 'Attendance Verifications'

    def __str__(self):
        return f"{self.attendance} - {self.lecturer}"


# ==============================
# FACE RECOGNITION LOG MODEL
# ==============================
class FaceRecognitionLog(models.Model):
    face_recognition_log_id = models.BigAutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    face_embedding = models.BinaryField()
    face_image_url = models.TextField(null=True, blank=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2)
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'face_recognition_logs'
        indexes = [
            models.Index(fields=['attendance']),
        ]
        verbose_name = 'Face Recognition Log'
        verbose_name_plural = 'Face Recognition Logs'

    def __str__(self):
        return f"{self.student.fullname} - {self.attendance}"


# ==============================
# QR CHECKIN MODEL
# ==============================
class QRCheckin(models.Model):
    qr_checkin_id = models.BigAutoField(primary_key=True)
    qr_code = models.CharField(max_length=255, unique=True)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    expire_at = models.TimeField(auto_now_add=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(Lecturer, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    usage_count = models.IntegerField(default=0)
    max_usage = models.IntegerField(default=1)
    radius = models.IntegerField(default=50)  # meters
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        db_table = 'qr_checkins'
        indexes = [
            models.Index(fields=['schedule']),
            models.Index(fields=['created_by']),
        ]
        verbose_name = 'QR Checkin'
        verbose_name_plural = 'QR Checkins'

    def __str__(self):
        return f"QR-{self.qr_code} - {self.schedule}"


# ==============================
# QR CHECKIN LOG MODEL
# ==============================
class QRCheckinLog(models.Model):
    qr_checkin_log_id = models.BigAutoField(primary_key=True)
    qr_checkin = models.ForeignKey(QRCheckin, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'qr_checkin_logs'
        indexes = [
            models.Index(fields=['qr_checkin', 'student']),
        ]
        verbose_name = 'QR Checkin Log'
        verbose_name_plural = 'QR Checkin Logs'

    def __str__(self):
        return f"{self.student.fullname} - {self.qr_checkin.qr_code}"