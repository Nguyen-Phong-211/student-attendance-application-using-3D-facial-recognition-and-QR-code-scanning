from rest_framework import serializers
from students.models import Major
from students.models import Subject, Department
from subjects.models import AcademicYear
from .models import Class
import random
from subjects.serializers import AcademicYearSerializer
from students.serializers import DepartmentSerializer
from subjects.models import AcademicYear
from students.models import Department

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
    academic_year_code = serializers.CharField(write_only=True)
    department_code = serializers.CharField(write_only=True)
    status = serializers.CharField()

    class Meta:
        model = Class
        fields = ['class_name', 'academic_year_code', 'department_code', 'status']

    def update(self, instance, validated_data):
        instance.class_name = validated_data.get('class_name', instance.class_name)
        instance.status = validated_data.get('status', instance.status)

        academic_year_code = validated_data.get('academic_year_code')
        if academic_year_code:
            instance.academic_year = AcademicYear.objects.get(academic_year_code=academic_year_code)

        department_code = validated_data.get('department_code')
        if department_code:
            instance.department = Department.objects.get(department_code=department_code)

        instance.save()
        return instance

