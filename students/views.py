from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import StudentSerializer, DepartmentSerializer, MajorSerializer
from .models import Department, Major
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from students.serializers import StudentGetListSerializer
from .models import Student

class CreateStudentView(APIView):
    permission_classes = [permissions.IsAuthenticated] 

    def post(self, request):
        serializer = StudentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Sinh viên tạo thành công'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DepartmentListAPIView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class MajorListAPIView(APIView):
    def get(self, request):
        majors = Major.objects.select_related('department').all()
        serializer = MajorSerializer(majors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class StudentListView(APIView):
    def get(self, request):
        students = Student.objects.select_related('account').all()
        serializer = StudentGetListSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
