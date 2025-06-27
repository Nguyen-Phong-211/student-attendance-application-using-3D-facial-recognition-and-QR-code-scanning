from django.db.models.signals import post_save
from django.dispatch import receiver
from audit.models import AuditLog
from attend3d.middleware.thread_local import get_current_request
from lecturers.models import LecturerSubject, SubjectClass

def get_request_meta():
    request = get_current_request()
    if request:
        return {
            'user': request.user if request.user.is_authenticated else None,
            'ip': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
    return {'user': None, 'ip': 'unknown', 'user_agent': 'unknown'}

@receiver(post_save, sender=LecturerSubject)
def log_lecturer_subject_create(sender, instance, created, **kwargs):
    if created:
        meta = get_request_meta()
        AuditLog.objects.create(
            operation='C',
            old_data={},
            new_data={
                "lecturer_id": instance.lecturer_id,
                "subject_id": instance.subject_id,
            },
            ip_address=meta['ip'],
            user_agent=meta['user_agent'],
            changed_by=meta['user'],
            record_id=str(instance.pk),
            entity_id=str(instance.pk),
            entity_name='LecturerSubject',
            action_description=f"Tự động log: Gán môn học cho giảng viên"
        )

@receiver(post_save, sender=SubjectClass)
def log_subject_class_create(sender, instance, created, **kwargs):
    if created:
        meta = get_request_meta()
        AuditLog.objects.create(
            operation='C',
            old_data={},
            new_data={
                "subject_id": instance.subject_id,
                "class_id": instance.class_id_id,
                "lecturer_id": instance.lecturer_id,
                "semester_id": instance.semester_id,
            },
            ip_address=meta['ip'],
            user_agent=meta['user_agent'],
            changed_by=meta['user'],
            record_id=str(instance.pk),
            entity_id=str(instance.pk),
            entity_name='SubjectClass',
            action_description=f"Tự động log: Gán lớp học cho giảng viên"
        )