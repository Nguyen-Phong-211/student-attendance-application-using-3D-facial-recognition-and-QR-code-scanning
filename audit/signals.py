import json
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.utils.timezone import now
from leaves.models import LeaveRequest
from .models import AuditLog
from accounts.models import Account 
import json
from decimal import Decimal
from django.db.models import FileField
from .utils import get_current_user, get_current_request, safe_model_to_dict

_old_instance_cache = {}

# ==================================================
# Write audit logs for LeaveRequest model when updated
# ==================================================
@receiver(pre_save, sender=LeaveRequest)
def before_leave_request_update(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = LeaveRequest.objects.get(pk=instance.pk)
            _old_instance_cache[instance.pk] = safe_model_to_dict(old_instance)
        except LeaveRequest.DoesNotExist:
            _old_instance_cache[instance.pk] = {}

# ==================================================
# Write audit logs for LeaveRequest model when saved
# ==================================================
@receiver(post_save, sender=LeaveRequest)
def after_leave_request_save(sender, instance, created, **kwargs):
    old_data = {}
    new_data = safe_model_to_dict(instance)

    operation = "C" if created else "U"
    if not created:
        old_data = _old_instance_cache.pop(instance.pk, {})

    user = get_current_user()
    request = get_current_request()

    AuditLog.objects.create(
        operation=operation,
        old_data=old_data,
        new_data=new_data,
        changed_by=user if user else Account.objects.first(),
        ip_address=request.META.get("REMOTE_ADDR") if request else "unknown",
        user_agent=request.META.get("HTTP_USER_AGENT") if request else "unknown",
        record_id=str(instance.pk),
        entity_id="leave_request",
        entity_name="LeaveRequest",
        action_description="Created leave request" if created else "Updated leave request",
    )