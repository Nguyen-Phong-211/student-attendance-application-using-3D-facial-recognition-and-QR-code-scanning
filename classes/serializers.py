from rest_framework import serializers
from students.models import Major
from students.models import Subject, Department
from subjects.models import AcademicYear
from .models import Class, Schedule
import random
from subjects.serializers import AcademicYearSerializer, SubjectSerializer, ShiftSerializer, LessonSlotSerializer, SubjectLeaveRequestSerializer
from students.serializers import DepartmentSerializer
from subjects.models import AcademicYear
from students.models import Department
from rooms.serializers import RoomSerializer, RoomScheduleSerializer
from subjects.serializers import LessonSlotByShiftSerializer

from lecturers.minimal_serializers import LecturerScheduleSerializer
from lecturers.models import SubjectClass

# ==================================================
# Function generate random code
# ==================================================
def generate_random_code():
    length = random.randint(10, 20)
    return ''.join(str(random.randint(0, 9)) for _ in range(length))
# ==================================================
# Get data major model
# ==================================================
class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = ['major_id', 'major_name', 'department']
# ==================================================
# Get data class model with academic year and department
# ==================================================
class ClassSerializer(serializers.ModelSerializer):
    # academic_year = serializers.CharField(source='academic_year.academic_year_name')
    academic_year = AcademicYearSerializer()
    department = DepartmentSerializer()
    class Meta:
        model = Class 
        fields = ['class_id', 'class_name', 'academic_year', 'department', 'class_code', 'status', 'created_at']
        
# ==================================================
# Create a class
# ==================================================
class ClassCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['class_code', 'class_name', 'department', 'academic_year', 'status', 'created_at']
        read_only_fields = ['class_code', 'created_at']
        
    def create(self, validated_data):
        validated_data['class_code'] = generate_random_code()
        return super().create(validated_data)

# ==================================================
# Update a class
# ==================================================
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

# ==================================================
# Get data schedule by class
# ==================================================
class ScheduleSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(source='subject_id', read_only=True)
    room = RoomSerializer(read_only=True)
    slot = LessonSlotByShiftSerializer(read_only=True)
    class_id = ClassSerializer(read_only=True)
    lecturer = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = [
            'schedule_id', 'start_time', 'end_time', 'repeat_weekly',
            'lesson_type', 'day_of_week',
            'class_id', 'subject', 'room', 'slot', 'lecturer'
        ]

    def get_lecturer(self, obj):
        subject_id = self.context.get("subject_id")

        subject_classes = SubjectClass.objects.filter(
            subject_id=subject_id
        ).select_related('lecturer', 'subject')

        lecturers = [sc.lecturer for sc in subject_classes if sc.lecturer]

        return LecturerScheduleSerializer(lecturers, many=True).data if lecturers else None
# ==================================================
# Get data classes for leave request function
# ==================================================
class ClassLeaveRequestSerializer(serializers.ModelSerializer):
    subject = SubjectLeaveRequestSerializer(read_only=True)
    lecturer = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ['class_id', 'class_name', 'academic_year_id', 'subject', 'lecturer']

    def get_lecturer(self, obj):
        from lecturers.serializers import LecturerLeaveRequestSerializer
        return LecturerLeaveRequestSerializer(obj.lecturer).data