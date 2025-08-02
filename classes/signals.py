from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils.timezone import now
from .models import Class
from accounts.models import Account
from notifications.models import Notification
from audit.models import AuditLog
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict

@receiver(pre_save, sender=Class)
def cache_old_data(sender, instance, **kwargs):
    try:
        instance._old_data = model_to_dict(sender.objects.get(pk=instance.pk))
    except sender.DoesNotExist:
        instance._old_data = None 

@receiver(post_save, sender=Class)
def create_logs_and_notifications(sender, instance, created, **kwargs):
    # 👇 Giả định user thực hiện là thuộc instance (cần truyền user từ views!)
    changed_by = getattr(instance, '_changed_by', None)
    ip_address = getattr(instance, '_ip_address', '')
    user_agent = getattr(instance, '_user_agent', '')

    if not changed_by:
        return  # tránh lỗi nếu thiếu thông tin

    # Create Notification
    if created:
        Notification.objects.create(
            title="Lớp học mới được tạo",
            content=f"Lớp học {instance.class_name} đã được thêm.",
            created_by=changed_by,
            to_target=changed_by
        )
        action = 'Tạo'
        operation = 'C'
    else:
        Notification.objects.create(
            title="Lớp học được cập nhật",
            content=f"Lớp học {instance.class_name} đã được cập nhật.",
            created_by=changed_by,
            to_target=changed_by
        )
        action = 'Cập nhật'
        operation = 'U'

    # Create AuditLog
    old_data = getattr(instance, '_old_data', {})
    new_data = model_to_dict(instance)

    AuditLog.objects.create(
        operation=operation,
        old_data=old_data or {},
        new_data=new_data,
        changed_by=changed_by,
        changed_at=now(),
        ip_address=ip_address,
        user_agent=user_agent,
        record_id=str(instance.class_id),
        entity_id='Class',
        entity_name='Class',
        action_description=f'{action} lớp học: {instance.class_name}'
    )
