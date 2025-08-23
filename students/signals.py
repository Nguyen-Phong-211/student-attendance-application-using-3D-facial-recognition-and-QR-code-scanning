from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Major, Student
from audit.models import AuditLog
from notifications.models import Notification
from django.forms.models import model_to_dict
from attend3d.middleware.thread_local import get_current_request
from accounts.models import Account
import json

_old_instance_cache = {}

def get_request_user_ip_agent():
    """ Get user, ip, user_agent from current request """
    request = get_current_request()
    if not request:
        return None, None, None
    user = getattr(request, "user", None)
    ip_address = request.META.get("REMOTE_ADDR", None)
    user_agent = request.META.get("HTTP_USER_AGENT", None)
    return user, ip_address, user_agent

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

# ==================================== Write for update information ==========================================
@receiver(pre_save, sender=Account)
def account_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Account.objects.get(pk=instance.pk)

            fields_to_convert = [f.name for f in Account._meta.fields if f.name != 'avatar_url']
            old_data = model_to_dict(old_instance, fields=fields_to_convert)

            if old_instance.avatar_url and hasattr(old_instance.avatar_url, 'url'):
                old_data['avatar_url'] = old_instance.avatar_url.url
            else:
                old_data['avatar_url'] = None
            
            _old_instance_cache[f"account_{instance.pk}"] = old_data

        except Account.DoesNotExist:
            pass


@receiver(post_save, sender=Account)
def account_post_save(sender, instance, created, **kwargs):
    old_data = _old_instance_cache.pop(f"account_{instance.pk}", None)

    fields_to_convert = [f.name for f in Account._meta.fields if f.name != 'avatar_url']
    new_data = model_to_dict(instance, fields=fields_to_convert)

    if instance.avatar_url and hasattr(instance.avatar_url, 'url'):
        new_data['avatar_url'] = instance.avatar_url.url
    else:
        new_data['avatar_url'] = None

    user, ip, ua = get_request_user_ip_agent()
    if not user:
        return

    AuditLog.objects.create(
        operation="C" if created else "U",
        old_data=old_data if old_data else {},
        new_data=new_data,
        changed_by=user,
        ip_address=ip or "",
        user_agent=ua or "",
        record_id=str(instance.pk),
        entity_id=str(instance.pk),
        entity_name="Account",
        action_description="Tài khoản được tạo" if created else "Cập nhật thông tin tài khoản",
    )

    # Record notification for the user to be updated
    Notification.objects.create(
        title="Cập nhật thông tin tài khoản",
        content="Thông tin tài khoản của bạn đã được cập nhật.",
        created_by=user,
        to_target=instance,
    )


# ======================== STUDENT ===========================
@receiver(pre_save, sender=Student)
def student_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Student.objects.get(pk=instance.pk)
            _old_instance_cache[f"student_{instance.pk}"] = model_to_dict(old_instance)
        except Student.DoesNotExist:
            pass


@receiver(post_save, sender=Student)
def student_post_save(sender, instance, created, **kwargs):
    old_data = _old_instance_cache.pop(f"student_{instance.pk}", None)
    new_data = model_to_dict(instance)

    user, ip, ua = get_request_user_ip_agent()
    if not user:
        return

    AuditLog.objects.create(
        operation="C" if created else "U",
        old_data=old_data if old_data else {},
        new_data=new_data,
        changed_by=user,
        ip_address=ip or "",
        user_agent=ua or "",
        record_id=str(instance.pk),
        entity_id=str(instance.pk),
        entity_name="Student",
        action_description="Hồ sơ sinh viên được tạo" if created else "Cập nhật thông tin sinh viên",
    )