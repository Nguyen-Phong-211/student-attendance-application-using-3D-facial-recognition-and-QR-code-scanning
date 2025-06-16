from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from accounts.models import Account

class AuditLog(models.Model):
    log_id = models.BigAutoField(primary_key=True)
    operation = models.CharField(max_length=1)
    old_data = models.JSONField(encoder=DjangoJSONEncoder)
    new_data = models.JSONField(encoder=DjangoJSONEncoder)
    changed_by = models.ForeignKey(Account, on_delete=models.CASCADE)
    changed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.CharField(max_length=255)
    user_agent = models.CharField(max_length=255)
    record_id = models.CharField(max_length=255)
    entity_id = models.CharField(max_length=255)
    entity_name = models.CharField(max_length=255)
    action_description = models.TextField(null=True)

    class Meta:
        db_table = 'audit_logs'
        indexes = [
            models.Index(fields=['changed_by']),
        ]
        managed = True
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        return self.operation
    
class LoginLog(models.Model):
    log_id = models.BigAutoField(primary_key=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    login_time = models.TimeField(auto_now=True)
    ip_address = models.CharField(max_length=255)
    user_agent = models.TextField()
    device_info = models.TextField()

    class Meta:
        db_table = 'login_logs'
        indexes = [
            models.Index(fields=['account_id']),
        ]
        managed = True
        verbose_name = 'Login Log'
        verbose_name_plural = 'Login Logs'