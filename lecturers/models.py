from django.db import models
from accounts.models import Account
from students.models import Department
from subjects.models import Subject
import random

def generate_random_code():
    return str(random.randint(10000000, 99999999))


class Lecturer(models.Model):
    lecturer_id = models.BigAutoField(primary_key=True)
    lecturer_code = models.CharField(max_length=8, unique=True, default=generate_random_code, null=True, blank=True)
    fullname = models.CharField(max_length=255)
    account = models.OneToOneField(Account, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    gender = models.CharField(max_length=1)
    dob = models.DateField()
    avatar_url = models.TextField(null=True)
    phone_number = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lecturers'
        indexes = [
            models.Index(fields=['account_id']),
            models.Index(fields=['department_id']),
        ]
        managed = True
        verbose_name = 'Lecturer'
        verbose_name_plural = 'Lecturers'

    def __str__(self):
        return self.fullname

class LecturerSubject(models.Model):
    lecturer_subject_id = models.BigAutoField(primary_key=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE) 
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lecturer_subjects'
        indexes = [
            models.Index(fields=['subject_id']),
            models.Index(fields=['lecturer_id']),
        ]
        managed = True
        verbose_name = 'Lecturer Subject'
        verbose_name_plural = 'Lecturer Subjects'

    def __str__(self):
        return f"{self.subject_id} - {self.lecturer_id}"
