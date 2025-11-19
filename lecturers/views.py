from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import (
    LecturerListSerializer, AllLecturerSerializer, LecturerAssignmentSerializer, 
    LecturerWithSubjectsSerializer, LecturerContactSerializer, TotalLecturerSerializer, GetScheduleLecturerSerializer,
)
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from .models import Lecturer, LecturerSubject
from lecturers.utils.email.assignment_class_subject_email import send_assignment_email
from classes.models import Class
from subjects.models import Subject, Semester
from audit.models import AuditLog
from notifications.models import Notification
from lecturers.utils.request import get_client_ip
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from datetime import date, timedelta

# ==================================================
# LECTURER LIST VIEW
# ==================================================
class LecturerListAPIView(generics.ListAPIView):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerListSerializer
    permission_classes = [permissions.IsAuthenticated]

# ==================================================
# ALL LECTURER VIEW
# ==================================================
class AllLecturerView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        lecturers = Student.objects.select_related('account').all()
        serializer = StudentGetListSerializer(lecturers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ==================================================
# LECTURER ASSIGNMENT VIEW
# ==================================================
class LecturerAssignmentAPIView(APIView):
    def post(self, request):
        serializer = LecturerAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()

            lecturer_id = request.data['lecturer_id']
            subject_ids = request.data['subject_ids']
            class_id = request.data['class_id']
            semester_id = request.data['semester_id']

            # Query data
            lecturer = Lecturer.objects.select_related('account').get(pk=lecturer_id)
            class_obj = Class.objects.get(pk=class_id)
            semester = Semester.objects.get(pk=semester_id)

            # Only send an email
            # send_assignment_email(
            #     to_email=lecturer.account.email,
            #     full_name=lecturer.fullname,
            #     subject_name=subject_names_str,
            #     class_name=class_obj.class_name,
            # )

            return Response({
                "message": "Gán giảng viên và gửi email thành công",
                "data": result
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==================================================
# LECTURER WITH SUBJECT VIEW
# ==================================================
class LecturerWithSubjectsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        lecturers = Lecturer.objects.select_related('account', 'department') \
            .prefetch_related('lecturersubject_set__subject',
                              'subjectclass_set__subject',
                              'subjectclass_set__class_id',
                              'subjectclass_set__semester') 

        serializer = LecturerWithSubjectsSerializer(lecturers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ==================================================
# LECTURER CONTACT VIEW
# ==================================================
class LecturerContactAPIView(APIView):
    def get(self, request):
        query = """
        SELECT
            sub.subject_id,
            sub.subject_name,
            l.fullname,
            acc.email,
            acc.phone_number,
            acc.avatar
        FROM subject_registration_requests srs
            JOIN schedules sh ON sh.schedule_id = srs.schedule_id
            JOIN lecturer_subjects ls ON ls.subject_id = sh.subject_id_id
            JOIN lecturers l ON l.lecturer_id = ls.lecturer_id
            JOIN accounts acc ON acc.account_id = l.account_id
            JOIN subjects sub ON ls.subject_id = sub.subject_id
        WHERE srs.status = 'approved'
            AND sh.status = '1'
            AND acc.is_locked = false
        """

        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            results = cursor.fetchall()
            rows = [dict(zip(columns, row)) for row in results]

        serializer = LecturerContactSerializer(rows, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# AMIN: Caculation the total of lecturer
# ==================================================
class TotalLecturerView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        total = Lecturer.objects.count()
        serializer = TotalLecturerSerializer({'total_lecturer': total})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
#Lịch dạy giảng viên

class GetScheduleLecturerView(APIView):
    def get(self, request, account_id):
        # 1. Get student_id from account_id
        # lecturer = Lecturer.objects.filter(account_id=account_id).first()
        # if not lecturer:
        #     return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        # lecturer_id = lecturer.lecturer_id

        query = """
        SELECT
            l.lecturer_id,
            l.fullname AS lecturer_name,
            sch.schedule_id,
            sch.day_of_week,
            sch.lesson_type,
            sub.subject_id,
            sub.subject_name,
            cl.class_id,
            cl.class_name,
            r.room_name,
            r.latitude,
            r.longitude,
            sh.shift_name,
            lss.slot_name,
            lss.start_time AS lesson_start_time,
            lss.end_time AS lesson_end_time
        FROM subject_registration_requests srr
        JOIN schedules sch ON srr.schedule_id = sch.schedule_id
        JOIN lecturer_subjects ls ON ls.subject_id = sch.subject_id_id
        JOIN lecturers l ON l.lecturer_id = ls.lecturer_id
        JOIN subjects sub ON sub.subject_id = sch.subject_id_id
        JOIN classes cl ON cl.class_id = sch.class_id_id
        JOIN rooms r ON r.room_id = sch.room_id
        JOIN lesson_slots lss ON lss.slot_id = sch.slot_id
        JOIN shifts sh ON sh.shift_id = lss.shift_id_id
        JOIN accounts acc ON acc.account_id = l.account_id
        WHERE acc.account_id = %s
            AND sch.repeat_weekly = true
            AND sch.status = '1'
            AND sub.status = '1'
            AND cl.status = '1'
            AND acc.is_locked = false
        """

        # 2. Query
        with connection.cursor() as cursor:
            cursor.execute(query, [account_id])
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # 3. Serialize the returned data
        serializer = GetScheduleLecturerSerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
#Theo tháng
class LecturerMonthlyScheduleView(APIView):
    def get(self, request, account_id):
        today = date.today()
        start_of_month = today.replace(day=1)
        if today.month == 12:
            end_of_month = date(today.year + 1, 1, 1) - timedelta(days=1)
        else:
            end_of_month = date(today.year, today.month + 1, 1) - timedelta(days=1)

        query = """
            SELECT 
                l.lecturer_id,
                l.fullname AS lecturer_name,
                sub.subject_name,
                cl.class_name,
                r.room_name,
                sh.shift_name,
                lss.start_time AS lesson_start_time,
                lss.end_time AS lesson_end_time,
                sch.day_of_week,
                sch.repeat_weekly,
                sch.schedule_id,
                sch.status AS schedule_status,
                MIN(g.occurrence_start AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') AS occurrence_start
            FROM schedules AS sch
            JOIN subject_registration_requests AS srr ON srr.schedule_id = sch.schedule_id
            JOIN lecturer_subjects AS ls ON ls.subject_id = sch.subject_id_id
            JOIN lecturers AS l ON l.lecturer_id = ls.lecturer_id
            JOIN accounts AS acc ON acc.account_id = l.account_id
            JOIN subjects AS sub ON sub.subject_id = sch.subject_id_id
            JOIN classes AS cl ON cl.class_id = sch.class_id_id
            JOIN rooms AS r ON r.room_id = sch.room_id
            JOIN lesson_slots AS lss ON lss.slot_id = sch.slot_id
            JOIN shifts AS sh ON sh.shift_id = lss.shift_id_id
            LEFT JOIN LATERAL (
                SELECT 
                    (gs::date + ((sch.day_of_week - 1) || ' day')::interval + lss.start_time) AS occurrence_start
                FROM generate_series(
                    DATE_TRUNC('month', %s::date),
                    DATE_TRUNC('month', %s::date) + INTERVAL '1 month' - INTERVAL '1 day',
                    INTERVAL '1 week'
                ) AS gs
            ) AS g ON sch.repeat_weekly = TRUE
            WHERE acc.account_id = %s
            AND sch.repeat_weekly = TRUE
            AND sch.status = '1'
            AND sub.status = '1'
            AND cl.status = '1'
            AND acc.is_locked = FALSE
            GROUP BY 
                l.lecturer_id,
                l.fullname,
                sub.subject_name,
                cl.class_name,
                r.room_name,
                sh.shift_name,
                lss.start_time,
                lss.end_time,
                sch.day_of_week,
                sch.repeat_weekly,
                sch.schedule_id,
                sch.status
            ORDER BY occurrence_start;
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [start_of_month, end_of_month, account_id])
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return Response(results, status=status.HTTP_200_OK)

# import os
# import base64
# import uuid
# from django.conf import settings
# from django.core.files.base import ContentFile
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from attendance.models import QRCheckin


# class CreateQRCheckinView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         data = request.data

#         try:
#             qr_code = data["qr_code"]
#             qr_image_base64 = data["qr_image_base64"]
#             expire_at = data["expire_at"]
#             latitude = data["latitude"]
#             longitude = data["longitude"]
#             created_by = data["created_by"]
#             schedule = data["schedule"]

#             qr_dir = os.path.join(settings.MEDIA_ROOT, "qr_codes")
#             os.makedirs(qr_dir, exist_ok=True)

#             image_data = qr_image_base64.split(",")[1]
#             file_name = f"{qr_code}_{uuid.uuid4().hex}.png"
#             file_path = os.path.join(qr_dir, file_name)

#             with open(file_path, "wb") as f:
#                 f.write(base64.b64decode(image_data))

#             qr = QRCheckin.objects.create(
#                 qr_code=qr_code,
#                 expire_at=expire_at,
#                 latitude=latitude,
#                 longitude=longitude,
#                 created_by_id=created_by,
#                 schedule_id=schedule,
#                 is_active=True,
#                 usage_count=0,
#                 max_usage=1,
#                 radius=50,
#                 qr_image_url=f"qr_codes/{file_name}",
#             )

#             return Response({
#                 "message": "✅ QR đã được tạo và lưu ảnh thành công!",
#                 "qr_checkin_id": qr.pk,
#                 "qr_image_url": request.build_absolute_uri(
#                     f"{settings.MEDIA_URL}qr_codes/{file_name}"
#                 ),
#             }, status=201)

#         except Exception as e:
#             print("❌ ERROR:", e)
#             return Response({"error": str(e)}, status=500)
        
class GetScheduleLecturerByScheduleView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request, schedule_id):
        query = """
        SELECT
            l.lecturer_id,
            acc.account_id,
            l.fullname AS lecturer_name,
            sch.schedule_id,
            sch.day_of_week,
            sch.lesson_type,
            sub.subject_id,
            sub.subject_name,
            cl.class_id,
            cl.class_name,
            r.room_name,
            r.latitude,
            r.longitude,
            sh.shift_name,
            lss.slot_name,
            lss.start_time AS lesson_start_time,
            lss.end_time AS lesson_end_time
        FROM schedules sch
        JOIN lecturer_subjects ls ON ls.subject_id = sch.subject_id_id
        JOIN lecturers l ON l.lecturer_id = ls.lecturer_id
        JOIN subjects sub ON sub.subject_id = sch.subject_id_id
        JOIN classes cl ON cl.class_id = sch.class_id_id
        JOIN rooms r ON r.room_id = sch.room_id
        JOIN lesson_slots lss ON lss.slot_id = sch.slot_id
        JOIN shifts sh ON sh.shift_id = lss.shift_id_id
        JOIN accounts acc ON acc.account_id = l.account_id
        WHERE sch.schedule_id = %s
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [schedule_id])
            columns = [col[0] for col in cursor.description]
            result = cursor.fetchone()

            if not result:
                return Response({"detail": "Schedule not found"}, status=404)

            data = dict(zip(columns, result))
        return Response(data, status=200)
    
import os
import base64
import uuid
from django.conf import settings
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from attendance.models import QRCheckin
from lecturers.models import Lecturer
from notifications.utils import send_qr_notifications


class CreateQRCheckinView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        try:
            # --- 1️⃣ Lưu thông tin QR ---
            qr_code = data["qr_code"]
            qr_image_base64 = data["qr_image_base64"]
            expire_at = data["expire_at"]
            latitude = data["latitude"]
            longitude = data["longitude"]
            created_by = data["created_by"]
            schedule = data["schedule"]

            # --- 2️⃣ Lưu ảnh QR ---
            qr_dir = os.path.join(settings.MEDIA_ROOT, "qr_codes")
            os.makedirs(qr_dir, exist_ok=True)

            image_data = qr_image_base64.split(",")[1]
            file_name = f"{qr_code}_{uuid.uuid4().hex}.png"
            file_path = os.path.join(qr_dir, file_name)

            with open(file_path, "wb") as f:
                f.write(base64.b64decode(image_data))

            # --- 3️⃣ Tạo bản ghi QR ---
            qr = QRCheckin.objects.create(
                qr_code=qr_code,
                expire_at=expire_at,
                latitude=latitude,
                longitude=longitude,
                created_by_id=created_by,
                schedule_id=schedule,
                is_active=True,
                usage_count=0,
                max_usage=1,
                radius=50,
                qr_image_url=f"qr_codes/{file_name}",
            )

            # --- 4️⃣ Gửi thông báo ---
            try:
                lecturer = Lecturer.objects.get(account_id=created_by)

                # Lấy class_id & subject_id từ schedule
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT class_id_id, subject_id_id
                        FROM schedules
                        WHERE schedule_id = %s
                    """, [schedule])
                    result = cursor.fetchone()

                if result:
                    class_id, subject_id = result

                    # 🔥 Truy vấn sinh viên theo lớp & môn học
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            SELECT DISTINCT
                                st.student_id, st.student_code, st.fullname
                            FROM classes c
                            JOIN schedules sch ON sch.class_id_id = c.class_id
                            JOIN subjects s ON sch.subject_id_id = s.subject_id
                            JOIN lecturer_subjects ls ON ls.subject_id = s.subject_id
                            JOIN student_subjects ss ON ss.subject_id = s.subject_id
                            JOIN students st ON st.student_id = ss.student_id
                            WHERE c.class_id = %s
                              AND s.subject_id = %s
                              AND ls.lecturer_id = %s
                            ORDER BY st.fullname;
                        """, [class_id, subject_id, lecturer.lecturer_id])

                        student_rows = [
                            {"student_id": row[0], "student_code": row[1], "fullname": row[2]}
                            for row in cursor.fetchall()
                        ]

                    print(f"DEBUG >>> class_id={class_id}, subject_id={subject_id}, found={len(student_rows)} sinh viên.")

                    # --- 5️⃣ Gửi thông báo ---
                    if student_rows:
                        qr_image_full_url = request.build_absolute_uri(f"{settings.MEDIA_URL}qr_codes/{file_name}")
                        send_qr_notifications(lecturer, student_rows, schedule, qr_image_full_url)
                    else:
                        print("⚠️ Không có sinh viên nào trong lớp/môn này!")

                else:
                    print("⚠️ Không tìm thấy lịch học để gửi thông báo!")

            except Exception as e:
                print("❌ Lỗi khi gửi thông báo:", e)

            # --- 6️⃣ Trả phản hồi ---
            return Response({
                "message": "✅ QR đã được tạo, lưu ảnh và gửi thông báo thành công!",
                "qr_checkin_id": qr.pk,
                "qr_image_url": request.build_absolute_uri(
                    f"{settings.MEDIA_URL}qr_codes/{file_name}"
                ),
            }, status=201)

        except Exception as e:
            print("❌ ERROR:", e)
            return Response({"error": str(e)}, status=500)
        
#TRANG

# ==================================================
# GET LECTURER BY ACCOUNT ID
# ==================================================
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Lecturer

class LecturerProfileView(APIView):
    def get(self, request, account_id):
        try:
            lecturer = Lecturer.objects.select_related('account').get(account__account_id=account_id)

            gender_text = (
                "Nam" if lecturer.gender == "1"
                else "Nữ" if lecturer.gender == "0"
                else "Không xác định"
            )

            data = {
                "fullname": lecturer.fullname,
                "lecturer_id": lecturer.lecturer_id,
                "email": lecturer.account.email,
                "phone_number": lecturer.account.phone_number,
                "gender": gender_text,
                "dob": lecturer.dob.isoformat() if lecturer.dob else None,
            }
            return Response(data, status=status.HTTP_200_OK)

        except Lecturer.DoesNotExist:
            return Response({"error": "Không tìm thấy giảng viên"}, status=status.HTTP_404_NOT_FOUND)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Lecturer
from .serializers import LecturerProfileSerializer

class LecturerProfileView(APIView):
    def get(self, request, account_id):
        try:
            lecturer = Lecturer.objects.select_related('account').get(account__account_id=account_id)
            serializer = LecturerProfileSerializer(lecturer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Lecturer.DoesNotExist:
            return Response({"error": "Không tìm thấy giảng viên"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, account_id):
        try:
            lecturer = Lecturer.objects.select_related('account').get(account__account_id=account_id)
        except Lecturer.DoesNotExist:
            return Response({"error": "Không tìm thấy giảng viên"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LecturerProfileSerializer(lecturer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



   