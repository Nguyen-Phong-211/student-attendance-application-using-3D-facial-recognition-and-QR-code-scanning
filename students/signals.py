from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Major
from audit.models import AuditLog
from notifications.models import Notification
from django.forms.models import model_to_dict
from attend3d.middleware.thread_local import get_current_request


@receiver(pre_save, sender=Major)
def store_old_major(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_instance = Major.objects.select_related('department').get(pk=instance.pk)
        except Major.DoesNotExist:
            instance._old_instance = None


@receiver(post_save, sender=Major)
def log_major_update(sender, instance, created, **kwargs):
    if created or not hasattr(instance, '_old_instance'):
        return

    request = get_current_request()
    user = getattr(request, 'user', None) if request else None
    ip = request.META.get("REMOTE_ADDR", "") if request else ""
    ua = request.META.get("HTTP_USER_AGENT", "") if request else ""

    if not user or not user.is_authenticated:
        return

    # Retrieve from DB to ensure department data is updated
    instance.refresh_from_db()

    old_instance = instance._old_instance
    changes = {}

    if old_instance.major_name != instance.major_name:
        changes['major_name'] = (old_instance.major_name, instance.major_name)

    if (old_instance.department and instance.department and 
        old_instance.department.department_id != instance.department.department_id):
        changes['department'] = (
            old_instance.department.department_name if old_instance.department else "Không có",
            instance.department.department_name if instance.department else "Không có"
        )

    # If there is any change then log.
    if changes:
        # Create Notification
        Notification.objects.create(
            title="Ngành học được cập nhật",
            content=f"Ngành {instance.major_name} đã được cập nhật.",
            created_by=user,
            to_target=user,
        )

        # Log Audit
        AuditLog.objects.create(
            operation='U',
            old_data=model_to_dict(old_instance),
            new_data=model_to_dict(instance),
            changed_by=user,
            ip_address=ip,
            user_agent=ua,
            record_id=str(instance.pk),
            entity_id="Major",
            entity_name=instance.major_name,
            action_description="Ngành học đã được cập nhật bởi admin"
        )