from rest_framework import serializers
from students.models import Major
from students.models import Subject, Department
from subjects.models import AcademicYear
from .models import Class
import random
from subjects.serializers import AcademicYearSerializer
from students.serializers import DepartmentSerializer

def generate_random_code():
    length = random.randint(10, 20)
    return ''.join(str(random.randint(0, 9)) for _ in range(length))

class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = ['major_id', 'major_name', 'department']
        
class ClassSerializer(serializers.ModelSerializer):
    # academic_year = serializers.CharField(source='academic_year.academic_year_name')
    academic_year = AcademicYearSerializer()
    department = DepartmentSerializer()
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

# Update a class
class ClassUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['class_name', 'department', 'academic_year', 'status']
        read_only_fields = ['class_code', 'created_at']
