from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Subject, AcademicYear
from .serializers import SubjectSerializer, AcademicYearSerializer
from rest_framework import generics


class SubjectListAPIView(APIView):
    def get(self, request):
        subjects = Subject.objects.select_related('academic_year', 'department').all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AcademicYearListAPIView(generics.ListAPIView):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer