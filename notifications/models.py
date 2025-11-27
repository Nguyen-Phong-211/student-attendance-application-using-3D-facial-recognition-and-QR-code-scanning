from django.db import models
from accounts.models import Account
from subjects.models import Subject
from students.models import Student
from helper.generate_random_code import generate_random_code

# ==================================================
# SET UP STATUS CHOICES
# ==================================================
class StatusChoice(models.TextChoices):
    PENDING = "P", "Pending"
    SENDED = "S", "Sended"
    ERROR = "E", "Error"
    SUCCESS = "U", "Success"

# ==================================================
# NOTIFICATION MODEL
# ==================================================
class Notification(models.Model):
    notification_id = models.BigAutoField(primary_key=True)
    notification_code = models.UUIDField(default=generate_random_code, unique=True)
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

# ==================================================
# REMINDER MODEL
# ==================================================
class Reminder(models.Model):
    reminder_id = models.BigAutoField(primary_key=True)
    reminder_code = models.UUIDField(default=generate_random_code, unique=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    email_notification = models.CharField(
        max_length=1, 
        choices=StatusChoice.choices, 
        default=StatusChoice.PENDING
    )
    status_send_email = models.CharField(
        max_length=1, 
        choices=StatusChoice.choices, 
        default=StatusChoice.PENDING
    )
    sms_notification = models.CharField(
        max_length=1, 
        choices=StatusChoice.choices, 
        default=StatusChoice.SENDED
    )
    status_send_sms = models.CharField(
        max_length=1, 
        choices=StatusChoice.choices, 
        default=StatusChoice.SENDED
    )
    application_notification = models.CharField(
        max_length=1,
        choices=StatusChoice.choices,
        default=StatusChoice.PENDING,
        null=True,
        blank=True
    )
    status_send_application = models.CharField(
        max_length=1, 
        choices=StatusChoice.choices, 
        default=StatusChoice.PENDING,
        null=True,
        blank=True
    )
    time_reminder = models.TimeField(auto_now_add=False, default='00:30:00')
    status_reminder = models.CharField(
        max_length=1,
        choices=StatusChoice.choices,
        default=StatusChoice.PENDING
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    sent_email_1h_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when 1-hour-before email was sent.")
    sent_email_30m_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when 30-minute-before email was sent.")

    class Meta:
        db_table = 'reminders'
        indexes = [
            models.Index(fields=['subject_id']),
            models.Index(fields=['student_id']),
        ]
        managed = True
        verbose_name = 'Reminder'
        verbose_name_plural = 'Reminders'

    def __str__(self):
        return self.title