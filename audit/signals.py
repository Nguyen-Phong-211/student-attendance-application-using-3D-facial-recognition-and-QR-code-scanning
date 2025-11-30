import json
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.utils.timezone import now
from leaves.models import LeaveRequest
from .models import AuditLog
from accounts.models import Account 
from decimal import Decimal
from django.db.models import FileField
from .utils import (
    get_current_request, safe_model_to_dict, 
    get_location, get_device_and_location, get_device_info, send_login_email
)
from helper.get_client_ip import get_client_ip
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from .models import LoginLog
from lecturers.models import Lecturer
from attend3d.middleware.thread_local import get_current_request
from accounts.utils.serializers import serialize_instance
from helper.get_client_ip import get_request_info
from lecturers.models import LecturerSubject, SubjectClass
from notifications.models import Reminder
import datetime
import decimal
import uuid
from django.db.models.fields.files import FieldFile
import logging
from .middleware import get_current_user
from django.core.management import get_commands

logger = logging.getLogger(__name__)
_old_instance_cache = {}
_PREVIOUS_STATE = {}

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
# Log successful login
# ==================================================
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    try:
        ip = get_client_ip(request)
        device = get_device_info(request)
        location = get_location(ip)
        info = get_device_and_location(request)

        LoginLog.objects.create(
            account=user if isinstance(user, Account) else None,
            status=LoginLog.Status.SUCCESS,
            ip_address=ip,
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            device_info={
                **device,
                "path": request.path,
                "method": request.method,
                "is_secure": request.is_secure(),
                # "location": location,
                "device_info": info,
            },
        )

        # User belongs to staff or superuser do not send email
        # if not user.is_staff and not user.is_superuser:
        #     send_login_email(user, ip_address, device)
        send_login_email(user, ip, device, location)

    except Exception as e:
        logger.error(f"Failed to log user login: {e}")

# ==================================================
# Log failed login
# ==================================================
@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    try:
        LoginLog.objects.create(
            account=None,  # no account associated with failed login
            status=LoginLog.Status.FAILED,
            ip_address=get_client_ip(request) if request else None,
            user_agent=request.META.get("HTTP_USER_AGENT", "") if request else None,
            device_info={
                "username": credentials.get("username") if credentials else None,
                "path": request.path if request else None,
                "method": request.method if request else None,
            },
        )
    except Exception as e:
        logger.error(f"Failed to log user login failed: {e}")
# ==================================================
# Log logout (update logout_time of last session)
# ==================================================
@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    try:
        # If user is not authenticated, return without logging
        if not isinstance(user, Account):
            logger.warning("User is not authenticated during logout.")
            return

        # Get the last active login log
        last_log = (
            LoginLog.objects.filter(
                account=user,
                status=LoginLog.Status.SUCCESS,
                logout_time__isnull=True,
            )
            .order_by("-login_time")
            .first()
        )

        if last_log:
            last_log.logout_time = now()
            last_log.save(update_fields=["logout_time"])
            logger.info(f"Logout time recorded for user {user.email}")
        else:
            logger.warning(f"No active login log found for user {user.email}")

    except Exception as e:
        logger.error(f"Failed to log user logout: {e}")
# ==================================================
# Get request metadata helper
# ==================================================
def get_request_meta():
    request = get_current_request()
    if request:
        return {
            "user": request.user if request.user.is_authenticated else None,
            "ip": request.META.get("REMOTE_ADDR"),
            "user_agent": request.META.get("HTTP_USER_AGENT", ""),
        }
    return {"user": None, "ip": "unknown", "user_agent": "unknown"}
# ==================================================
# Create log for all model, including create, update and delete
# ==================================================
def json_safe(value):
    if isinstance(value, (datetime.datetime, datetime.date)):
        return value.isoformat()
    if isinstance(value, decimal.Decimal):
        return float(value)
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, FieldFile):
        return value.url if value and hasattr(value, "url") else None
    return value
    
def serialize_instance(instance, exclude_fields=None):
    """
    Convert model instance -> dict JSON-safe.
    Image/FileField sẽ chỉ lấy đường dẫn (string).
    """
    try:
        data = model_to_dict(instance)

        # Ignore fields
        if exclude_fields:
            for f in exclude_fields:
                data.pop(f, None)

        safe_data = {}
        for k, v in data.items():
            if isinstance(v, list):  # ManyToMany -> list ids
                safe_data[k] = [obj.pk if hasattr(obj, "pk") else str(obj) for obj in v]
            elif hasattr(v, "pk"):  # ForeignKey -> id
                safe_data[k] = v.pk
            else:
                safe_data[k] = json_safe(v)

        return safe_data
    except Exception as e:
        return {"id": getattr(instance, "pk", None), "error": str(e)}


@receiver(pre_save)
def audit_pre_save(sender, instance, **kwargs):
    """
    Save old instance data before updating.
    """
    if sender.__name__ == "AuditLog":
        return  # avoid logging itself, causing recursion
    if not instance.pk:  
        return  # new object (create), no need for old_data

    try:
        old_instance = sender.objects.get(pk=instance.pk)
        _PREVIOUS_STATE[(sender, instance.pk)] = serialize_instance(old_instance)
    except sender.DoesNotExist:
        pass


def is_running_management_command():
    import sys
    commands = get_commands()
    return len(sys.argv) > 1 and sys.argv[1] in commands

@receiver(post_save)
def audit_post_save(sender, instance, created, **kwargs):
    if sender.__name__ == "AuditLog":
        return
    if is_running_management_command():
        return  # ignore during migrate/seed/loaddata

    old_data = None
    if not created:
        old_data = _PREVIOUS_STATE.pop((sender, instance.pk), None)

    AuditLog.objects.create(
        operation=AuditLog.Operation.CREATE if created else AuditLog.Operation.UPDATE,
        old_data=old_data,
        new_data=serialize_instance(instance),
        entity_id=str(instance.pk),
        entity_name=sender.__name__,
        module_name=instance._meta.app_label,
        action_description=f"{'Created' if created else 'Updated'} {sender.__name__} (ID={instance.pk})",
        changed_by=get_current_user(),
    )

@receiver(post_delete)
def audit_post_delete(sender, instance, **kwargs):
    """
    Log when model is deleted.
    """
    if sender.__name__ == "AuditLog":
        return

    AuditLog.objects.create(
        operation=AuditLog.Operation.DELETE,
        old_data=serialize_instance(instance),
        new_data=None,
        entity_id=str(instance.pk),
        entity_name=sender.__name__,
        module_name=instance._meta.app_label,
        action_description=f"Deleted {sender.__name__} (ID={instance.pk})",
        changed_by=get_current_user(),
    )