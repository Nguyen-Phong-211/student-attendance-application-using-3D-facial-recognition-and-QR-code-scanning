from django.db import models
import random
from accounts.models import Account
from subjects.models import Subject, Semester

def generate_random_code():
    length = random.randint(10, 20) 
    return ''.join(str(random.randint(0,9)) for _ in range(length))

class Department(models.Model):
    department_id = models.BigAutoField(primary_key=True)
    department_name = models.CharField(max_length=255, unique=True)
    department_code = models.CharField(max_length=20, default=generate_random_code, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'departments'
        managed = True
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'

    def __str__(self):
        return self.department_name

class Major(models.Model):
    major_id = models.BigAutoField(primary_key=True)
    major_name = models.CharField(max_length=255)
    major_code = models.CharField(max_length=20, default=generate_random_code, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    department = models.ForeignKey('students.Department', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'majors'
        indexes = [
            models.Index(fields=['department_id']),
        ]
        managed = True
        verbose_name = 'Major'
        verbose_name_plural = 'Majors'

    def __str__(self):
        return self.major_name

class Student(models.Model):
    student_id = models.BigAutoField(primary_key=True)
    student_code = models.CharField(max_length=20, default=generate_random_code, unique=True)
    fullname = models.CharField(max_length=255)
    face_embedding = models.BinaryField(null=True)
    department = models.ForeignKey('students.Department', on_delete=models.CASCADE)
    profile_attachments = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    account = models.OneToOneField(Account, on_delete=models.CASCADE)
    gender = models.CharField(max_length=1)
    dob = models.DateField()
    status = models.CharField(max_length=1)
    is_graduated = models.CharField(max_length=1, default='0')
    major = models.ForeignKey(Major, on_delete=models.CASCADE)

    class Meta:
        db_table = 'students'
        indexes = [
            models.Index(fields=['department']),
            models.Index(fields=['major']),
            models.Index(fields=['account']),
        ]
        managed = True
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return self.fullname

class StudentSubject(models.Model):
    student_subject_id = models.BigAutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    max_leave_days = models.IntegerField()
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    registration_status = models.CharField(max_length=20, default='auto')
    created_at = models.DateTimeField(auto_now_add=True)
    registered_by_account = models.ForeignKey("accounts.Account", on_delete=models.CASCADE, null=True)
    # Change
    subject_registration_request = models.ForeignKey("students.SubjectRegistrationRequest", on_delete=models.CASCADE, null=True)
    # End change

    class Meta:
        db_table = 'student_subjects'
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['subject_id']),
            models.Index(fields=['semester_id']),
            models.Index(fields=['registered_by_account_id']),
            models.Index(fields=['subject_registration_request_id']),
        ]
        managed = True
        verbose_name = 'Student Subject'
        verbose_name_plural = 'Student Subjects'

    def __str__(self):
        return f"{self.student_id} - {self.subject_id}"

class Device(models.Model):
    device_id = models.BigAutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    device_name = models.CharField(max_length=255)
    ip = models.CharField(max_length=100)
    user_agent = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'devices'
        indexes = [
            models.Index(fields=['student_id']),
        ]
        managed = True
        verbose_name = 'Device'
        verbose_name_plural = 'Devices'

    def __str__(self):
        return self.device_name

class SubjectRegistrationRequest(models.Model):
    subject_registration_request_id = models.BigAutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    reason = models.TextField(null=True)
    status = models.CharField(max_length=1, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(auto_now=True)
    is_over_credit_limit = models.BooleanField(default=False)
    approved_by = models.ForeignKey('staffs.Staff', on_delete=models.CASCADE)

    class Meta:
        db_table = 'subject_registration_requests'
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['subject_id']),
            models.Index(fields=['semester_id']),
            models.Index(fields=['approved_by_id']),
        ]
        managed = True
        verbose_name = 'Subject Registration Request'
        verbose_name_plural = 'Subject Registration Requests'

    def __str__(self):
        return f"{self.student_id} - {self.subject_id}"

class CreditLimit(models.Model):
    credit_limit_id = models.BigAutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    min_credits = models.IntegerField()
    max_credits = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'credit_limits'
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['semester_id']),
        ]
        managed = True
        verbose_name = 'Credit Limit'
        verbose_name_plural = 'Credit Limits'

    def __str__(self):
        return f"{self.student_id} - {self.credit_limit}"