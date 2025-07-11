from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.utils.timezone import now
from notifications.models import Notification
from accounts.models import Account
from audit.models import AuditLog
import json

@receiver(user_logged_in)
def handle_user_login(sender, request, user, **kwargs):
    ip = get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT", "unknown")

    # 1. Create Notification
    Notification.objects.create(
        title="Đăng nhập thành công",
        content=f"Tài khoản của bạn đã đăng nhập lúc {now().strftime('%H:%M:%S %d-%m-%Y')}",
        created_by=user,
        to_target=user
    )

    # 2. Create AuditLog
    AuditLog.objects.create(
        operation='L',  # L = Login
        old_data={},
        new_data={},
        changed_by=user,
        ip_address=ip,
        user_agent=user_agent,
        record_id=str(user.pk),
        entity_id=str(user.pk),
        entity_name='Account',
        action_description=f"Người dùng {user.email} đăng nhập lúc {now().strftime('%H:%M:%S %d-%m-%Y')}"
    )


def get_client_ip(request):
    """Lấy IP thật của client"""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0]
    return request.META.get("REMOTE_ADDR", "")