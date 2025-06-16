from django.db import models
from students.models import Student
from subjects.models import Subject
from lecturers.models import Lecturer

class LeaveRequest(models.Model):
    leave_request_id = models.BigAutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    reason = models.TextField()
    from_date = models.DateTimeField(auto_now_add=True)
    to_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=1)
    attachment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    approved_by = models.ForeignKey(Lecturer, on_delete=models.CASCADE)
    rejected_reason = models.TextField(null=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'leave_requests'
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['subject_id']),
            models.Index(fields=['approved_by']),
        ]
        verbose_name = 'Leave Request'
        verbose_name_plural = 'Leave Requests'

    def __str__(self):
        return self.reason
