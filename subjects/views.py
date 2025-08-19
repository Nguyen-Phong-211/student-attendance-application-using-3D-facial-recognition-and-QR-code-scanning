from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Subject, AcademicYear, Semester
from .serializers import SubjectSerializer, AcademicYearSerializer, SemesterSerializer, SemesterByAcademicSerializer, DisplaySubjectForRegistion
from rest_framework import generics


class SubjectListAPIView(APIView):
    def get(self, request):
        subjects = Subject.objects.select_related('academic_year', 'department').all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AcademicYearListAPIView(generics.ListAPIView):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    
class SemesterListAPIView(APIView):
    def get(self, request):
        semesters = Semester.objects.select_related('academic_year').all()
        serializer = SemesterSerializer(semesters, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SemesterByAcademicAPIView(APIView):
    def get(self, request, academic_year_id):
        semesters = Semester.objects.filter(academic_year_id=academic_year_id)
        serializer = SemesterByAcademicSerializer(semesters, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# display subject
class DisplaySubjectForRegistionAPIView(APIView):
    def get(self, request, academic_year_id=None):
        subjects = Subject.objects.select_related('academic_year', 'department') \
                                  .filter(status='1')

        if academic_year_id:  # Filter by academic_year_id
            subjects = subjects.filter(academic_year_id=academic_year_id)

        serializer = DisplaySubjectForRegistion(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)