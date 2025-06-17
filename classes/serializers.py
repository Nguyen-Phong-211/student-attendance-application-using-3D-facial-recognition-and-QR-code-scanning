from rest_framework import serializers
from students.models import Major
from students.models import Subject, Department
from subjects.models import AcademicYear
from .models import Class

class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = ['major_id', 'major_name', 'department']
        
class ClassSerializer(serializers.ModelSerializer):
    academic_year = serializers.CharField(source='academic_year.academic_year_name')
    department = serializers.CharField(source='department.department_name')
    class Meta:
        model = Class 
        fields = ['class_id', 'class_name', 'academic_year', 'department', 'class_code', 'status', 'created_at']
        
