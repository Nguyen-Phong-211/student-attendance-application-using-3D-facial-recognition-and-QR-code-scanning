from django.db import models
from students.models import Student
from subjects.models import Subject
from lecturers.models import Lecturer


class LeaveStatus(models.TextChoices):
    PENDING = "P", "Pending"
    APPROVED = "A", "Approved"
    REJECTED = "R", "Rejected"


class LeaveRequest(models.Model):
    leave_request_id = models.BigAutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    reason = models.TextField()
    from_date = models.DateTimeField()
    to_date = models.DateTimeField()

    status = models.CharField(
        max_length=1,
        choices=LeaveStatus.choices,
        default=LeaveStatus.PENDING
    )
    rejected_reason = models.TextField(null=True, blank=True)

    attachment = models.FileField(upload_to="leave_attachments/", null=True, blank=True)

    approved_by = models.ForeignKey(
        Lecturer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_leave_requests"
    )

    reviewed_at = models.DateTimeField(null=True, blank=True)

    to_target = models.ForeignKey(
        Lecturer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="targeted_leave_requests" 
    )

    academic_year = models.ForeignKey(
        "subjects.AcademicYear",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    semester = models.ForeignKey(
        "subjects.Semester",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leave_requests'
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['subject']),
            models.Index(fields=['approved_by']),
        ]
        verbose_name = 'Leave Request'
        verbose_name_plural = 'Leave Requests'

    def __str__(self):
        return f"{self.student} - {self.reason[:30]}"