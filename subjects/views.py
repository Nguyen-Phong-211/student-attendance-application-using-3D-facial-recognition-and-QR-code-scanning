from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Subject, AcademicYear, Semester
from .serializers import SubjectSerializer, AcademicYearSerializer, SemesterSerializer, SemesterByAcademicSerializer, DisplaySubjectForRegistion
from rest_framework import generics
from django.utils import timezone
from datetime import datetime

class SubjectListAPIView(APIView):
    def get(self, request):
        subjects = Subject.objects.select_related('academic_year', 'department').all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
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

# display subject
class DisplaySubjectForRegistionAPIView(APIView):
    def get(self, request, academic_year_id=None):
        subjects = Subject.objects.select_related('academic_year', 'department') \
                                  .filter(status='1')

        if academic_year_id:  # Filter by academic_year_id
            subjects = subjects.filter(academic_year_id=academic_year_id)

        serializer = DisplaySubjectForRegistion(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)