from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from students.models import Department
from students.serializers import DepartmentSerializer
from .models import Class
from students.models import Major
from .serializers import MajorSerializer, ClassSerializer
from rest_framework.views import APIView
from rest_framework import generics

@api_view(['GET'])
def get_departments(request):
    departments = Department.objects.all()
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_major_by_department(request, department_id):
    majors = Major.objects.filter(department_id=department_id)
    serializer = MajorSerializer(majors, many=True)
    return Response(serializer.data)

class ClassListAPIView(APIView):
    def get(self, request):
        classes = Class.objects.all()
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)
