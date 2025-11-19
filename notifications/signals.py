from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.utils.timezone import now
from notifications.models import Notification, Reminder
from accounts.models import Account
from audit.models import AuditLog
import json
from django.db.models.signals import post_save
from attend3d.middleware.thread_local import get_current_request
from helper.get_client_ip import get_client_ip
from lecturers.models import LecturerSubject, SubjectClass, Lecturer
from leaves.models import LeaveRequest
from contact.models import Contact
from students.models import Student
from staffs.models import Staff
from .utils import send_notification_to_user

# ==================================================
# Extention: Create and push notification
# ==================================================
def _create_and_push_notification(**kwargs):
    """
    Create and push notification realtime
    """
    try:
        notification = Notification.objects.create(**kwargs)

        if notification.to_target:
            send_notification_to_user(
                notification.to_target.account_id,
                {
                    "title": notification.title,
                    "content": notification.content,
                    "created_at": notification.created_at.isoformat(),
                },
            )
    except Exception as e:
        print(f"[Realtime Error] Không thể tạo/gửi notification: {e}")


@receiver(user_logged_in)
def handle_user_login(sender, request, user, **kwargs):
    ip = get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT", "unknown")

    _create_and_push_notification(
        title="Đăng nhập thành công",
        content=f"Tài khoản của bạn đã đăng nhập lúc {now().strftime('%H:%M:%S %d-%m-%Y')}",
        created_by=user,
        to_target=user,
    )
# ==================================================
# Create notification when lecturer is created
# ==================================================
@receiver(post_save, sender=Lecturer)
def notify_new_lecturer(sender, instance, created, **kwargs):
    if not created:
        return

    request = get_current_request()
    if not request or not hasattr(instance, "account"):
        return

    _create_and_push_notification(
        title=f"Tài khoản giảng viên mới: {instance.fullname}",
        content=f"Giảng viên {instance.fullname} đã được thêm vào hệ thống.",
        created_by=request.user,
        to_target=instance.account,
    )
# ==================================================
# Create notification when lecturer subject model is created
# ==================================================
@receiver(post_save, sender=SubjectClass)
def notify_subject_class(sender, instance, created, **kwargs):
    if not created:
        return

    request = get_current_request()
    user = request.user if request else None

    _create_and_push_notification(
        title=f"Phân công giảng viên {instance.lecturer.fullname}",
        content=f"Giảng viên {instance.lecturer.fullname} được phân công dạy môn "
                f"{instance.subject.subject_name} cho lớp {instance.class_id.class_name} "
                f"(học kỳ {instance.semester.semester_name}).",
        created_by=user,
        to_target=instance.lecturer.account,
    )
# ==================================================
# Create notification when reminder data is created
# ==================================================
@receiver(post_save, sender=Reminder)
def create_notification_for_reminder(sender, instance, created, **kwargs):
    if created:
        _create_and_push_notification(
            title=f"Nhắc nhở: {instance.title}",
            content=instance.content,
            created_by=instance.student.account,
            to_target=instance.student.account,
        )
# ==================================================
# Create notification when leave request is created
# ==================================================
@receiver(post_save, sender=LeaveRequest)
def create_notification_for_leave_request(sender, instance, created, **kwargs):
    if created:
        _create_and_push_notification(
            title=f"Bạn đã xin nghỉ phép môn {instance.subject.subject_name}",
            content=instance.reason,
            created_by=instance.student.account,
            to_target=instance.student.account,
        )
# ==================================================
# Create notification when contact is created
# ==================================================
@receiver(post_save, sender=Contact)
def create_contact_notification(sender, instance, created, **kwargs):
    if not created:
        return

    try:
        student = instance.from_person
        if not student or not hasattr(student, 'account'):
            print(f"[Signal Skip] Người gửi không phải sinh viên, contact_id={instance.contact_id}")
            return

        created_by_account = student.account
        to_account = None
        to_name = None

        if instance.type_person_contact == Contact.TypePersonContact.LECTURER:
            lecturer = Lecturer.objects.select_related('account').filter(lecturer_id=instance.to_person_id).first()
            if lecturer:
                to_account = lecturer.account
                to_name = lecturer.fullname

        elif instance.type_person_contact == Contact.TypePersonContact.ADMIN:
            staff = Staff.objects.select_related('account').filter(staff_id=instance.to_person_id).first()
            if staff:
                to_account = staff.account
                to_name = staff.fullname

        # Send notification to lecturer or admin (lecturer/admin)
        if to_account:
            _create_and_push_notification(
                title=f"Liên hệ mới từ {student.fullname}",
                content=f"Sinh viên {student.fullname} vừa gửi liên hệ về: {instance.subject}",
                created_by=created_by_account,
                to_target=to_account,
            )

        # Send notification to student (student)
        _create_and_push_notification(
            title=f"Bạn đã gửi liên hệ đến {to_name or 'bộ phận liên quan'}",
            content=f"Liên hệ của bạn về {instance.subject or 'Admin hệ thống'} đã được gửi thành công.",
            created_by=created_by_account,
            to_target=created_by_account,
        )

        print(f"[Signal Success] Tạo và gửi thông báo realtime cho contact_id={instance.contact_id}")

    except Exception as e:
        print(f"[Signal Error] Không thể tạo notification cho contact_id={instance.contact_id}: {e}")
# ==================================================
# Create notification for lecturer when leave request is created
# ==================================================
@receiver(post_save, sender=LeaveRequest)
def create_notification_for_lecturer(sender, instance, created, **kwargs):
    """
    Automatically send a notification to the lecturer when a leave request is created
    """
    if created:
        student = instance.student
        lecturer = instance.to_target

        if not lecturer or not lecturer.account:
            return

        title = f"Yêu cầu xin nghỉ học mới từ {student.fullname}"
        content = (
            f"Sinh viên {student.fullname} ({student.student_code}) vừa gửi yêu cầu nghỉ học cho môn "
            f"{instance.subject.subject_name}.\n"
            f"Thời gian nghỉ: {instance.from_date.strftime('%d/%m/%Y')} - {instance.to_date.strftime('%d/%m/%Y')}.\n"
            f"Lý do: {instance.reason}"
        )

        Notification.objects.create(
            title=title,
            content=content,
            created_by=student.account,
            to_target=lecturer.account,
        )
        