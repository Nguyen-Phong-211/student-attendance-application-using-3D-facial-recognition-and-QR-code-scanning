from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Subject, AcademicYear, Semester
from .serializers import (
    SubjectSerializer, AcademicYearSerializer, SemesterSerializer, 
    SemesterByAcademicSerializer, DisplaySubjectForRegistion, StudentSubjectSerializer
)
from rest_framework import generics
from django.utils import timezone
from datetime import datetime
from django.db import connection

# ==================================================
# Get all subjects
# ==================================================
class SubjectListAPIView(APIView):
    def get(self, request):
        subjects = Subject.objects.select_related('academic_year', 'department').all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Get nearest academic year
# ==================================================
class AcademicYearListAPIView(generics.ListAPIView):
    serializer_class = AcademicYearSerializer

    def get_queryset(self):
        current_year = datetime.now().year
        queryset = AcademicYear.objects.all()

        filtered_queryset = []
        for year in queryset:
            try:
                start_year = int(year.academic_year_name.split('-')[0])
                if start_year == current_year:
                    filtered_queryset.append(year)
            except (ValueError, IndexError):
                continue

        return filtered_queryset

# class AcademicYearListAPIView(generics.ListAPIView): 
#     queryset = AcademicYear.objects.all() 
#     serializer_class = AcademicYearSerializer
    
class SemesterListAPIView(APIView):
    def get(self, request):
        semesters = Semester.objects.select_related('academic_year').all()
        serializer = SemesterSerializer(semesters, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Get nearest semester
# ==================================================
class SemesterByAcademicAPIView(APIView):
    def get(self, request, academic_year_id):
        today = timezone.now().date()

        semesters = Semester.objects.filter(
            academic_year_id=academic_year_id,
            status='1'
        )

        if not semesters.exists():
            return Response([], status=status.HTTP_200_OK)

        semesters_future_or_current = [s for s in semesters if s.end_date >= today]

        if not semesters_future_or_current:
            return Response([], status=status.HTTP_200_OK)

        nearest_semester = min(
            semesters_future_or_current,
            key=lambda s: abs((s.start_date - today).days)
        )

        serializer = SemesterByAcademicSerializer(nearest_semester)
        return Response([serializer.data], status=status.HTTP_200_OK)
# ==================================================
# Display subject for registion view
# ==================================================
class DisplaySubjectForRegistionAPIView(APIView):
    def get(self, request, academic_year_id=None):
        subjects = Subject.objects.select_related('academic_year', 'department') \
                                  .filter(status='1')

        if academic_year_id:  # Filter by academic_year_id
            subjects = subjects.filter(academic_year_id=academic_year_id)

        serializer = DisplaySubjectForRegistion(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# ==================================================
# Get all subject of student view
# ==================================================
class StudentSubjectView(APIView):
    def get(self, request, account_id):
        subjects = Subject.objects.filter(
            subjectregistrationrequest__status="approved",
            status="1",
            subjectregistrationrequest__student__account__account_id=account_id
        ).distinct()  # avoid duplicates if any due to joins

        serializer = StudentSubjectSerializer(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# TRANG THÊM

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django.db import connection

# class GetSubjectByClassView(APIView):
#     permission_classes = [IsAuthenticated]  # đảm bảo user đã login

#     def get(self, request, class_id):
#         lecturer_id = request.user.id  # lấy giảng viên từ login
#         query = """
#              SELECT DISTINCT
#                 c.class_id,
#                 c.class_name,
#                 s.subject_id,
#                 s.subject_code,
#                 s.subject_name
#             FROM classes c
#             JOIN schedules sch ON sch.class_id_id = c.class_id
#             JOIN subjects s ON sch.subject_id_id = s.subject_id
#             JOIN lecturer_subjects ls ON ls.subject_id = s.subject_id
#             JOIN student_subjects ss ON ss.subject_id = s.subject_id
#             WHERE c.class_id = %s
#             AND ls.lecturer_id = %s
#             ORDER BY s.subject_name;
#         """
#         with connection.cursor() as cursor:
#             cursor.execute(query, [class_id, lecturer_id])
#             columns = [col[0] for col in cursor.description]
#             results = [dict(zip(columns, row)) for row in cursor.fetchall()]

#         return Response(results, status=200)

    
