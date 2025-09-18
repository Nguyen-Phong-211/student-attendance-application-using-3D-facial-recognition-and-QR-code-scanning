from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from accounts.models import Account

class AuditLog(models.Model):
    OPERATION_CHOICES = [
        ('C', 'Create'),
        ('R', 'Read'),
        ('U', 'Update'),
        ('D', 'Delete'),
    ]

    log_id = models.BigAutoField(primary_key=True)
    operation = models.CharField(max_length=1, choices=OPERATION_CHOICES)
    old_data = models.JSONField(encoder=DjangoJSONEncoder)
    new_data = models.JSONField(encoder=DjangoJSONEncoder)
    changed_by = models.ForeignKey(Account, on_delete=models.CASCADE)
    changed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.CharField(max_length=255)
    user_agent = models.CharField(max_length=255)
    record_id = models.CharField(max_length=255)  # Possibly merge with entity_id if redundant
    entity_id = models.CharField(max_length=255)
    entity_name = models.CharField(max_length=255)
    action_description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'audit_logs'
        indexes = [
            models.Index(fields=['changed_by']),
        ]
        managed = True
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        return f"{self.get_operation_display()} by {self.changed_by.email} on {self.changed_at.strftime('%Y-%m-%d %H:%M:%S')}"

class LoginLog(models.Model):
    log_id = models.BigAutoField(primary_key=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now_add=True)  # Corrected to DateTimeField
    ip_address = models.CharField(max_length=255)
    user_agent = models.TextField()
    device_info = models.TextField()

    class Meta:
        db_table = 'login_logs'
        indexes = [
            models.Index(fields=['account']),
        ]
        managed = True
        verbose_name = 'Login Log'
        verbose_name_plural = 'Login Logs'

    def __str__(self):
        return f"Login by {self.account.email} at {self.login_time.strftime('%Y-%m-%d %H:%M:%S')}"
