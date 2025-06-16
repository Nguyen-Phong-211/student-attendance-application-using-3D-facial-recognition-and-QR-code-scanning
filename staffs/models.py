from django.db import models
from accounts.models import Account
from students.models import Department

class Staff(models.Model):
    staff_id = models.BigAutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    account = models.OneToOneField('accounts.Account', on_delete=models.CASCADE)
    department = models.ForeignKey('students.Department', on_delete=models.CASCADE)
    gender = models.CharField(max_length=1)
    dob = models.DateField()
    avatar_url = models.TextField(null=True)
    phone_number = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'staffs'
        indexes = [
            models.Index(fields=['account_id']),
            models.Index(fields=['department_id']),
        ]
        managed = True
        verbose_name = 'Staff'
        verbose_name_plural = 'Staffs'
        
    def __str__(self):
        return self.fullname
    
class ImportLog(models.Model):
    import_log_id = models.BigAutoField(primary_key=True)
    staff = models.ForeignKey("staffs.Staff", on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    import_type = models.CharField(max_length=100)
    status = models.CharField(max_length=50)
    error_report = models.TextField(null=True)
    created_at = models.TimeField(auto_now=True)
    
    class Meta:
        db_table = 'import_logs'
        indexes = [
            models.Index(fields=['staff_id']),
        ]
        managed = True
        verbose_name = 'Import Log'
        verbose_name_plural = 'Import Logs'
        
    def __str__(self):
        return self.file_name
