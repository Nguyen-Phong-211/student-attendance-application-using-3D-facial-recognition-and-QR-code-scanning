# ==================================================
# API: Dashboard Overview (Tổng quan giảng viên)
# ==================================================
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import connection
from .models import Lecturer


class LecturerOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            lecturer = Lecturer.objects.get(account=request.user)
        except Lecturer.DoesNotExist:
            return Response({"detail": "Không tìm thấy giảng viên"}, status=404)

        lecturer_id = lecturer.lecturer_id

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    COUNT(DISTINCT ls.subject_id) AS total_subjects,
                    COUNT(DISTINCT sc.class_id_id) AS total_classes,
                    COUNT(DISTINCT cs.student_id) AS total_students
                FROM lecturer_subjects ls
                LEFT JOIN lecturers l ON ls.lecturer_id = l.lecturer_id
                LEFT JOIN subjects s ON ls.subject_id = s.subject_id
                LEFT JOIN subject_classes sc ON s.subject_id = sc.subject_id
                LEFT JOIN class_students cs ON sc.class_id_id = cs.class_id_id AND cs.is_active = TRUE
                WHERE l.lecturer_id = %s;
            """, [lecturer_id])

            row = cursor.fetchone()

        total_subjects = row[0] if row and row[0] is not None else 0
        total_classes = row[1] if row and row[1] is not None else 0
        total_students = row[2] if row and row[2] is not None else 0

        return Response({
            "totalSubjects": total_subjects,
            "totalClasses": total_classes,
            "totalStudents": total_students,
        })
        
# Đơn..
