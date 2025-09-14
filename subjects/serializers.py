from rest_framework import serializers
from .models import Subject, AcademicYear, Semester, Shift, LessonSlot
from students.models import Department
from students.serializers import DepartmentSerializer

# ==================================================
# Get data general academic year model
# ==================================================
class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['academic_year_id', 'academic_year_name', 'academic_year_code']
# ==================================================
# Get data gerneral subject for list function
# ==================================================
class SubjectSerializer(serializers.ModelSerializer):
    academic_year = AcademicYearSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    status_display = serializers.SerializerMethodField() 

    class Meta:
        model = Subject
        fields = [
            'subject_id', 'subject_code', 'subject_name',
            'academic_year', 'department',
            'theoretical_credits', 'practical_credits', 'total_credits',
            'status', 'status_display' 
        ]

    def get_status_display(self, obj):
        return 'Hoạt động' if obj.status else 'Bảo trì'
# ==================================================
# Get data semester lecturer for list function
# ==================================================
class SemesterSerializer(serializers.ModelSerializer):
    academic_year = AcademicYear()
    class Meta:
        model = Semester
        fields = '__all__'
# ==================================================
# Get data semester by academic year
# ==================================================
class SemesterByAcademicSerializer(serializers.ModelSerializer):
    academic_year = AcademicYear()
    class Meta:
        model = Semester
        fields = '__all__'

# ==================================================
# Get data subject for registion
# ==================================================
class DisplaySubjectForRegistion(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    academic_year = AcademicYearSerializer(read_only=True)
    class Meta:
        model = Subject
        fields = ['subject_id', 'subject_name', 'theoretical_credits', 'practical_credits', 'total_credits', 'department', 'academic_year']

# ==================================================
# Get data gerneral shift for list function
# ==================================================
class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ["shift_id", "shift_name", "start_time", "end_time", "status"]

# ==================================================
# Get data gerneral lesson slot for list function
# ==================================================
class LessonSlotSerializer(serializers.ModelSerializer):
    shift = ShiftSerializer(read_only=True)
    class Meta:
        model = LessonSlot
        fields = ["slot_id", "slot_name", "start_time", "end_time", "duration_minutes", "shift"]

# ==================================================
# Get data lesson slot by shift
# ==================================================
class LessonSlotByShiftSerializer(serializers.ModelSerializer):
    shift = ShiftSerializer(source="shift_id", read_only=True)
    class Meta:
        model = LessonSlot
        fields = '__all__'
# ==================================================
# Get data subjects for leave request function
# ==================================================
class SubjectLeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['subject_id', 'subject_name']