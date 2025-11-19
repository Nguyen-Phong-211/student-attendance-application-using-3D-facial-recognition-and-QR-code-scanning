# attend/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from classes.models import Class
from lecturers.models import Lecturer, SubjectClass
from students.models import Student
from subjects.models import Subject
from .serializers import ClassSerializer, SubjectSerializer, StudentSerializer

class LecturerClassesView(APIView):
    """Lấy danh sách lớp theo giảng viên"""
    def get(self, request, account_id):
        try:
            lecturer = Lecturer.objects.filter(account_id=account_id).first()
            if not lecturer:
                return Response({"detail": "Giảng viên không tồn tại"}, status=404)

            classes = Class.objects.filter(
                subject_classes__lecturer=lecturer
            ).distinct()

            serializer = ClassSerializer(classes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LecturerClassSubjectsView(APIView):
    """Lấy danh sách môn học của lớp do giảng viên dạy"""
    def get(self, request, class_id, account_id):
        try:
            lecturer = Lecturer.objects.filter(account_id=account_id).first()
            if not lecturer:
                return Response({"detail": "Giảng viên không tồn tại"}, status=404)

            subjects = Subject.objects.filter(
                subject_classes__class_id_id=class_id,
                subject_classes__lecturer=lecturer
            ).distinct()

            serializer = SubjectSerializer(subjects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StudentsByClassSubjectView(APIView):
    """Lấy danh sách sinh viên theo lớp + môn do giảng viên dạy"""
    def get(self, request, class_id, subject_id, account_id):
        try:
            # Kiểm tra giảng viên có dạy môn này trong lớp
            if not SubjectClass.objects.filter(
                subject_id=subject_id,
                class_id_id=class_id,
                lecturer__account_id=account_id
            ).exists():
                return Response({"detail": "Giảng viên không dạy môn này trong lớp"}, status=400)

            # Lấy danh sách sinh viên đăng ký môn
            students = Student.objects.filter(
                studentsubject__subject_id=subject_id,
                class_students__class_id=class_id
            ).distinct().order_by('fullname')

            serializer = StudentSerializer(students, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ====================================================
# Thống kê ĐƠN NGHỈ theo lớp + môn + giảng viên
# ====================================================

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from attendance.models import Attendance
from students.models import Student
from subjects.models import Subject
from classes.models import Class

@api_view(["GET"])
def lecturer_dashboard_statistics(request):
    """API: Thống kê điểm danh của giảng viên theo lớp và môn"""
    class_id = request.GET.get("class_id")
    subject_id = request.GET.get("subject_id")

    if not class_id or not subject_id:
        return Response({"detail": "Thiếu class_id hoặc subject_id"}, status=400)

    try:
        total_attendance = Attendance.objects.filter(
            schedule__subject_id=subject_id,
            schedule__class_id=class_id
        ).count()

        total_present = Attendance.objects.filter(
            schedule__subject_id=subject_id,
            schedule__class_id=class_id,
            status="P"
        ).count()

        total_absent = Attendance.objects.filter(
            schedule__subject_id=subject_id,
            schedule__class_id=class_id,
            status="A"
        ).count()

        data = {
            "totalAttendance": total_attendance,
            "totalPresent": total_present,
            "totalAbsent": total_absent,
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from lecturers.models import SubjectClass
from leaves.models import LeaveRequest


class LeaveRequestStatsView(APIView):
    """
    Lấy thống kê số đơn nghỉ theo lớp + môn do giảng viên dạy:
      - pending_requests: đơn chưa duyệt (status='P')
      - approved_requests: đơn đã duyệt (status='A')
      - rejected_requests: đơn bị từ chối (status='R')
    """

    def get(self, request, class_id, subject_id, account_id):
        try:
            # Kiểm tra giảng viên có dạy môn này trong lớp
            if not SubjectClass.objects.filter(
                subject_id=subject_id,
                class_id_id=class_id,
                lecturer__account_id=account_id
            ).exists():
                return Response(
                    {"detail": "Giảng viên không dạy môn này trong lớp"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Lấy tất cả đơn nghỉ của sinh viên thuộc lớp + môn đó
            leave_requests = LeaveRequest.objects.filter(
                subject_id=subject_id,
                student__class_students__class_id=class_id
            )

            # Đếm số lượng theo trạng thái
            pending_requests = leave_requests.filter(status='P').count()  # Chưa duyệt
            approved_requests = leave_requests.filter(status='A').count()
            rejected_requests = leave_requests.filter(status='R').count()

            # Đổi key `total_leave_requests` → `pending_requests`
            data = {
                "pending_requests": pending_requests,
                "approved_requests": approved_requests,
                "rejected_requests": rejected_requests,
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class LeavePieStatsView(APIView):
    """
    API: Thống kê xin nghỉ phép theo lớp và môn (dành cho biểu đồ tròn)
    Trả về số lượng từng trạng thái: Pending / Approved / Rejected
    """
    def get(self, request, class_id, subject_id, account_id):
        try:
            if not SubjectClass.objects.filter(
                class_id_id=class_id,
                subject_id=subject_id,
                lecturer__account_id=account_id
            ).exists():
                return Response({"detail": "Giảng viên không dạy lớp này"}, status=400)

            leave_requests = LeaveRequest.objects.filter(
                subject_id=subject_id,
                student__class_students__class_id=class_id
            )

            data = {
                "pending": leave_requests.filter(status="P").count(),
                "approved": leave_requests.filter(status="A").count(),
                "rejected": leave_requests.filter(status="R").count(),
            }
            return Response(data, status=200)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from leaves.models import LeaveRequest
from lecturers.models import SubjectClass

class LeavePieStatsView(APIView):
    """
    API: Thống kê xin nghỉ phép theo lớp và môn (dành cho biểu đồ tròn)
    Trả về số lượng từng trạng thái: Pending / Approved / Rejected
    """
    def get(self, request, class_id, subject_id, account_id):
        try:
            if not SubjectClass.objects.filter(
                class_id_id=class_id,
                subject_id=subject_id,
                lecturer__account_id=account_id
            ).exists():
                return Response({"detail": "Giảng viên không dạy lớp này"}, status=400)

            leave_requests = LeaveRequest.objects.filter(
                subject_id=subject_id,
                student__class_students__class_id=class_id
            )

            data = {
                "pending": leave_requests.filter(status="P").count(),
                "approved": leave_requests.filter(status="A").count(),
                "rejected": leave_requests.filter(status="R").count(),
            }
            return Response(data, status=200)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)
        
# ====================================================
# API LẤY THÔNG TIN CHO XUẤT FILE EXCEL
# ====================================================
@api_view(["GET"])
def get_class_info(request, class_id):
    try:
        cls = Class.objects.get(pk=class_id)
        return Response({"class_name": cls.class_name}, status=200)
    except Class.DoesNotExist:
        return Response({"detail": "Không tìm thấy lớp"}, status=404)


@api_view(["GET"])
def get_subject_info(request, subject_id):
    try:
        subject = Subject.objects.get(pk=subject_id)
        return Response({"subject_name": subject.subject_name}, status=200)
    except Subject.DoesNotExist:
        return Response({"detail": "Không tìm thấy môn học"}, status=404)


@api_view(["GET"])
def get_lecturer_by_account(request, account_id):
    try:
        lecturer = Lecturer.objects.get(account_id=account_id)
        return Response({"fullname": lecturer.fullname}, status=200)
    except Lecturer.DoesNotExist:
        return Response({"detail": "Không tìm thấy giảng viên"}, status=404)


