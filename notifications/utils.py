from django.db import connection
# from notifications.models import Notification
# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync

def get_schedule_info(student_id, subject_id):
    query = """
    WITH week AS (
        SELECT date_trunc('week', CURRENT_DATE)::date AS week_start
    )
    SELECT DISTINCT ON (sch.schedule_id)
        st.student_id,
        st.fullname AS student_name,
        sub.subject_name,
        cl.class_name,
        sh.start_time AS shift_start_time,
        sch.start_time::time AS lesson_start,
        CASE 
            WHEN sch.repeat_weekly = '1' THEN
                w.week_start::timestamp 
                + ((COALESCE(sch.day_of_week, EXTRACT(ISODOW FROM sch.start_time)::int) - 1) || ' day')::interval
                + sch.start_time::time
            ELSE sch.start_time
        END AS occurrence_start
    FROM schedules AS sch
    JOIN subjects AS sub ON sub.subject_id = sch.subject_id_id
    JOIN classes AS cl ON cl.class_id = sch.class_id_id
    JOIN subject_registration_requests AS srr ON srr.schedule_id = sch.schedule_id
    JOIN lesson_slots AS ls ON ls.slot_id = sch.slot_id
    JOIN shifts AS sh ON sh.shift_id = ls.shift_id_id
    JOIN students AS st ON st.student_id = srr.student_id
    CROSS JOIN week w
    WHERE srr.status = 'approved'
    AND srr.student_id = %s
    AND sub.subject_id = %s
    LIMIT 1
    """
    with connection.cursor() as cursor:
        cursor.execute(query, [student_id, subject_id])
        row = cursor.fetchone()
        if not row:
            return None
        # mapping column names (as defined in the query)
        return {
            "student_id": row[0],
            "student_name": row[1],
            "subject_name": row[2],
            "class_name": row[3],
            "shift_start_time": row[4],
            "lesson_start": row[5],
            "occurrence_start": row[6],
        }
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification_to_user(account_id, data: dict):
    """
    Gửi thông báo realtime đến user qua Channels Layer.
    """
    channel_layer = get_channel_layer()
    if not channel_layer:
        print("[Realtime] Channel layer chưa được cấu hình.")
        return

    group_name = f"user_{account_id}"

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_notification",
            "content": data,
        },
    )
    #TRANG
# def send_notification(to_account_id, title, content):
#     """
#     Tạo Notification và gửi realtime qua channels.
#     """
#     notification = Notification.objects.create(
#         to_target_id=to_account_id,
#         title=title,
#         content=content,
#         is_read='0'
#     )
#     # gửi realtime qua WebSocket
#     channel_layer = get_channel_layer()
#     async_to_sync(channel_layer.group_send)(
#         f"user_{to_account_id}",
#         {
#             "type": "send_notification",
#             "message": {
#                 "id": notification.id,
#                 "title": notification.title,
#                 "content": notification.content,
#                 "created_at": str(notification.created_at),
#                 "is_read": notification.is_read
#             }
#         }
#     )

#TRANG
from .models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification(to_target_id, title, content):
    """
    Hàm tạo thông báo và gửi qua WebSocket.
    """
    notification = Notification.objects.create(
        to_target_id=to_target_id,
        title=title,
        content=content,
        is_read='0'
    )

    # Gửi real-time nếu có WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{to_target_id}",
        {
            "type": "send_notification",
            "content": {
                "notification_id": notification.notification_id,
                "title": notification.title,
                "content": notification.content,
                "created_at": str(notification.created_at)
            }
        }
    )

    return notification

# notifications/utils.py
from notifications.models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_notification(to_target_id, title, content, created_by=None):
    """
    Hàm tạo thông báo và gửi qua WebSocket (Realtime).
    """
    notification = Notification.objects.create(
        title=title,
        content=content,
        created_by=created_by,      # có thể là giảng viên hoặc hệ thống
        to_target_id=to_target_id,  # người nhận (Account)
        is_read='0',                # model là CharField, không phải BooleanField
    )

    # Gửi realtime nếu Channels hoạt động
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f"user_{to_target_id}",
            {
                "type": "send_notification",
                "content": {
                    "notification_id": notification.notification_id,
                    "title": notification.title,
                    "content": notification.content,
                    "created_at": str(notification.created_at),
                    "is_read": notification.is_read,
                },
            },
        )

    return notification
# from notifications.models import Notification
# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync

# def send_notification(to_target_id, title, content, created_by=None):
#     """
#     Tạo Notification và gửi qua WebSocket realtime.
#     """
#     notification = Notification.objects.create(
#         title=title,
#         content=content,
#         created_by=created_by,
#         to_target_id=to_target_id,
#         is_read='0'
#     )

#     channel_layer = get_channel_layer()
#     if channel_layer:
#         async_to_sync(channel_layer.group_send)(
#             f"user_{to_target_id}",  # ⚠️ phải khớp với account_id trong frontend
#             {
#                 "type": "send_notification",
#                 "content": {
#                     "id": notification.notification_id,
#                     "title": notification.title,
#                     "content": notification.content,
#                     "created_at": str(notification.created_at),
#                     "is_read": notification.is_read,
#                 },
#             },
#         )

#     return notification

from django.utils import timezone
from notifications.models import Notification
from accounts.models import Account


def send_qr_notifications(lecturer, student_rows, schedule_id, qr_image_url=None):
    """
    Gửi thông báo QR check-in tới sinh viên và giảng viên (có link xem mã QR).
    """
    # --- Nội dung chung ---
    title = f"📢 Mã QR điểm danh mới cho lịch học #{schedule_id}"
    content = (
        f"Giảng viên {lecturer.fullname} đã tạo mã QR điểm danh mới.\n"
        f"👉 <a href='{qr_image_url}' target='_blank'>Nhấn vào đây để xem mã QR</a>"
    )

    # --- 1️⃣ Gửi cho tất cả sinh viên ---
    for student in student_rows:
        try:
            account = Account.objects.get(student=student["student_id"])

            Notification.objects.create(
                title=title,
                content=content,                # Có link trong nội dung
                created_by=lecturer.account,
                to_target=account,
                is_read='0',
            )

        except Exception as e:
            print(f"[Signal Error] Không thể gửi thông báo QR cho {student['fullname']}: {e}")

    # --- 2️⃣ Gửi lại cho chính giảng viên ---
    try:
        Notification.objects.create(
            title="✅ Đã tạo mã QR điểm danh thành công",
            content=(
                f"Bạn đã tạo mã QR điểm danh cho lịch học #{schedule_id}.\n"
            ),
            created_by=lecturer.account,
            to_target=lecturer.account,
            is_read='0',
        )
        print(f"✅ Đã gửi thông báo xác nhận cho giảng viên {lecturer.fullname}.")
    except Exception as e:
        print(f"⚠️ Lỗi khi gửi thông báo cho giảng viên: {e}")
