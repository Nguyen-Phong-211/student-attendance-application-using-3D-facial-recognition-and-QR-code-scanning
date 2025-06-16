from rest_framework import serializers
from .models import Subject, AcademicYear
from students.models import Department

class SubjectSerializer(serializers.ModelSerializer):
    academic_year = serializers.CharField(source='academic_year.academic_year_name')
    department = serializers.CharField(source='department.department_name')
    status_display = serializers.SerializerMethodField() 

    class Meta:
        model = Subject
        fields = [
            'subject_id', 'subject_code', 'subject_name',
            'academic_year', 'department',
            'theoretical_credits', 'practical_credits',
            'status', 'status_display' 
        ]

    def get_status_display(self, obj):
        return 'Hoạt động' if obj.status else 'Bảo trì'
    
class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['academic_year_id', 'academic_year_name', 'academic_year_code']