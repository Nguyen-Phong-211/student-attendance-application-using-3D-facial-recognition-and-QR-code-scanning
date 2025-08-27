from rest_framework import serializers
from .models import Subject, AcademicYear, Semester, Shift, LessonSlot
from students.models import Department
from students.serializers import DepartmentSerializer

class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['academic_year_id', 'academic_year_name', 'academic_year_code']

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
        
class SemesterSerializer(serializers.ModelSerializer):
    academic_year = AcademicYear()
    class Meta:
        model = Semester
        fields = '__all__'

class SemesterByAcademicSerializer(serializers.ModelSerializer):
    academic_year = AcademicYear()
    class Meta:
        model = Semester
        fields = '__all__'

# Display subjects to register
class DisplaySubjectForRegistion(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    academic_year = AcademicYearSerializer(read_only=True)
    class Meta:
        model = Subject
        fields = ['subject_id', 'subject_name', 'theoretical_credits', 'practical_credits', 'total_credits', 'department', 'academic_year']

# ======================= SHIFT ==============================
class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ["shift_id", "shift_name", "start_time", "end_time", "status"]

# ======================= LESSON SLOTS =======================
class LessonSlotSerializer(serializers.ModelSerializer):
    shift = ShiftSerializer(read_only=True)
    class Meta:
        model = LessonSlot
        fields = ["slot_id", "slot_name", "start_time", "end_time", "duration_minutes", "shift"]

# ======================= LESSON SLOTS BY SHIFT ===============
class LessonSlotByShiftSerializer(serializers.ModelSerializer):
    shift = ShiftSerializer(source="shift_id", read_only=True)
    class Meta:
        model = LessonSlot
        fields = '__all__'