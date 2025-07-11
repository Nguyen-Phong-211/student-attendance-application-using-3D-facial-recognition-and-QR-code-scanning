from django.db import models
from accounts.models import Account
from subjects.models import Subject
from subjects.models import AcademicYear
from students.models import Student

class Notification(models.Model):
    notification_id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_by = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='notifications_created')
    is_read = models.CharField(max_length=1, default='0')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # add column
    to_target = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='notifications_received', null=True)

    class Meta:
        db_table = 'notifications'
        indexes = [
            models.Index(fields=['created_by']),
            models.Index(fields=['to_target']),
        ]
        managed = True
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return self.title

class Reminder(models.Model):
    reminder_id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(auto_now_add=True)
    email_notification = models.CharField(max_length=1)
    time_reminder = models.TimeField(auto_now_add=False, default='30:00:00')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    class Meta:
        db_table = 'reminders'
        indexes = [
            models.Index(fields=['subject_id']),
            models.Index(fields=['academic_year_id']),
            models.Index(fields=['student_id']),
        ]
        managed = True
        verbose_name = 'Reminder'
        verbose_name_plural = 'Reminders'

    def __str__(self):
        return self.title


