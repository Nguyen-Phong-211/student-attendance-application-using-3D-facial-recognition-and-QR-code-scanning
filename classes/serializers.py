from rest_framework import serializers
from students.models import Major
from students.models import Subject, Department
from subjects.models import AcademicYear
from .models import Class
import random

def generate_random_code():
    length = random.randint(10, 20)
    return ''.join(str(random.randint(0, 9)) for _ in range(length))

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
        
# Create a class
class ClassCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['class_code', 'class_name', 'department', 'academic_year', 'status', 'created_at']
        read_only_fields = ['class_code', 'created_at']
        
    def create(self, validated_data):
        validated_data['class_code'] = generate_random_code()
        return super().create(validated_data)
        
