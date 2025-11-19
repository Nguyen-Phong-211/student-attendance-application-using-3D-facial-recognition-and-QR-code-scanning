# from django.db import models
# from django.contrib.contenttypes.models import ContentType
# from django.contrib.contenttypes.fields import GenericForeignKey
# from helper.generate_random_code import generate_random_code

# # ==============================
# # CONTACT MODEL
# # ==============================
# class Contact(models.Model):
#     class TypePersonContact(models.TextChoices):
#         ADMIN = 'ADMIN', 'Admin'
#         LECTURER = 'LECTURER', 'Lecturer'

#     class Status(models.TextChoices):
#         UNREAD = 'UNREAD', 'Unread'
#         READ = 'READ', 'Read'
#         REPLIED = 'REPLIED', 'Replied'

#     contact_id = models.BigAutoField(primary_key=True)
#     contact_code = models.UUIDField(default=generate_random_code, unique=True)

#     fullname = models.CharField(max_length=255, null=True, blank=True)
#     email = models.EmailField(null=True, blank=True)
#     phone_number = models.CharField(max_length=10, null=True, blank=True)

#     type_person_contact = models.CharField(max_length=10, choices=TypePersonContact.choices)

#     from_person = models.ForeignKey('students.Student', on_delete=models.CASCADE)

#     # Using GenericForeignKey to connect to Lecturer and Staff models
#     to_person_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to={
#         'model__in': ('lecturer', 'staff')
#     })
#     to_person_id = models.PositiveIntegerField()
#     to_person = GenericForeignKey('to_person_type', 'to_person_id')

#     subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, null=True, blank=True)

#     message = models.TextField()
#     response = models.TextField(null=True, blank=True)
#     status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNREAD)
#     status_response = models.CharField(max_length=10, choices=Status.choices, default=Status.UNREAD)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         ordering = ['-created_at']
#         db_table = 'contacts'
#         verbose_name = 'Contact'
#         verbose_name_plural = 'Contacts'

#     def __str__(self):
#         return str(self.contact_code)
    
# #TRANG


from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from helper.generate_random_code import generate_random_code

class Contact(models.Model):
    class TypePersonContact(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        LECTURER = 'LECTURER', 'Lecturer'
        STUDENT = 'STUDENT', 'Student'

    class Status(models.TextChoices):
        UNREAD = 'UNREAD', 'Unread'
        READ = 'READ', 'Read'
        REPLIED = 'REPLIED', 'Replied'

    contact_id = models.BigAutoField(primary_key=True)
    contact_code = models.UUIDField(default=generate_random_code, unique=True)

    fullname = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=10, null=True, blank=True)

    type_person_contact = models.CharField(max_length=10, choices=TypePersonContact.choices)

    # GenericForeignKey cho người gửi (Student hoặc Lecturer)
    from_person_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='from_person_type')
    from_person_id = models.PositiveIntegerField()
    from_person = GenericForeignKey('from_person_type', 'from_person_id')

    # GenericForeignKey cho người nhận
    to_person_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='to_person_type')
    to_person_id = models.PositiveIntegerField()
    to_person = GenericForeignKey('to_person_type', 'to_person_id')

    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, null=True, blank=True)

    message = models.TextField()
    response = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNREAD)
    status_response = models.CharField(max_length=10, choices=Status.choices, default=Status.UNREAD)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'contacts'
        verbose_name = 'Contact'
        verbose_name_plural = 'Contacts'

    def __str__(self):
        return str(self.contact_code)
