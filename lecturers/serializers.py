from rest_framework import serializers
import base64
import uuid
from django.core.files.base import ContentFile
from rest_framework import serializers
from accounts.models import Account
from students.serializers import DepartmentSerializer
from .models import Lecturer, SubjectClass, LecturerSubject
from accounts.serializers import AccountListSerializer, AccountInformationSerializer
from classes.models import Class
from subjects.models import Semester, Subject
from subjects.serializers import SubjectSerializer, SemesterSerializer
from classes.serializers import ClassSerializer

# ==================================================
# Get data gerneral lecturer for list function
# ==================================================
class LecturerListSerializer(serializers.ModelSerializer):
    account = AccountListSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    class Meta: 
        model = Lecturer
        fields = ['lecturer_id', 'fullname', 'gender', 'dob', 'lecturer_code', 'account', 'department']

# ==================================================
# Get data lecturer for leave request function
# ==================================================
class LecturerLeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecturer
        fields = ['lecturer_id', 'fullname']
# ==================================================
# Get data all lecturer. Admin function
# ==================================================
class AllLecturerSerializer(serializers.ModelSerializer):
    account = AccountListSerializer(read_only=True)
    class Meta:
        model = Lecturer
        fields = '__all__'
# ==================================================
# Get data subject class model for register subject
# ==================================================
class SubjectClassSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer()
    class_id = serializers.SerializerMethodField()
    semester = SemesterSerializer()
    class Meta:
        model = SubjectClass
        fields = '__all__'
        
    def get_class_id(self, obj):
        return {
            'class_id': obj.class_id.class_id,
            'class_name': obj.class_id.class_name,
            'class_code': obj.class_id.class_code
        }
# ==================================================
# Get data lecturer with subject
# ==================================================
# For example: If lecturer_id is 1, it will return all subjects of lecturer_id 1
class LecturerWithSubjectsSerializer(serializers.ModelSerializer):
    account = AccountListSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    # subjects = serializers.SerializerMethodField()
    subject_classes = serializers.SerializerMethodField()
    class Meta:
        model = Lecturer
        fields = [
            'lecturer_id',
            'lecturer_code',
            'fullname',
            'gender',
            'dob',
            'account',
            'department',
            # 'subjects',
            'subject_classes',
        ]

    def get_subjects(self, obj):
        subject_qs = Subject.objects.filter(
            lecturersubject__lecturer_id=obj.lecturer_id
        ).distinct()
        return SubjectSerializer(subject_qs, many=True).data
    
    def get_subject_classes(self, obj):
        subject_classes_qs = SubjectClass.objects.filter(lecturer=obj)
        return SubjectClassSerializer(subject_classes_qs, many=True).data
# ==================================================
# Assign subject to lecturer. Admin function
# ==================================================
class LecturerAssignmentSerializer(serializers.Serializer):
    lecturer_id = serializers.IntegerField()
    subject_ids = serializers.ListField(child=serializers.IntegerField())
    class_id = serializers.IntegerField()
    academic_year_id = serializers.IntegerField()
    semester_id = serializers.IntegerField()

    def create(self, validated_data):
        lecturer_id = validated_data['lecturer_id']
        subject_ids = validated_data['subject_ids']
        class_id = validated_data['class_id']
        semester_id = validated_data['semester_id']

        lecturer = Lecturer.objects.get(pk=lecturer_id)
        class_obj = Class.objects.get(pk=class_id)
        semester = Semester.objects.get(pk=semester_id)

        lecturer_subject_ids = []
        subject_class_ids = []

        for subject_id in subject_ids:
            subject = Subject.objects.get(pk=subject_id)

            lecturer_subject, _ = LecturerSubject.objects.get_or_create(
                lecturer=lecturer,
                subject=subject
            )

            subject_class = SubjectClass.objects.filter(
                lecturer=lecturer,
                subject=subject,
                class_id=class_obj,
                semester=semester
            ).first()

            if not subject_class:
                subject_class = SubjectClass.objects.create(
                    lecturer=lecturer,
                    subject=subject,
                    class_id=class_obj,
                    semester=semester
                )
            
            lecturer_subject_ids.append(lecturer_subject.pk)
            subject_class_ids.append(subject_class.pk)

        return {
            "lecturer_subject_ids": lecturer_subject_ids,
            "subject_class_ids": subject_class_ids
        }
# ==================================================
# Get data lecturer with account information
# ==================================================
# For example: If lecturer_id is 1, it will return a account of lecturer_id 1
class LecturerWithAccountSerializer(serializers.ModelSerializer):
    account = AccountInformationSerializer(read_only=True)
    class Meta:
        model = LecturerSubject
        fields = [
            'fullname',
            'account'
        ]
# ==================================================
# Get data subject class model
# ==================================================
class SubjectClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectClass
        fields = '__all__'

# ==================================================
# Get data lecturer for schedule function
# ==================================================
class LecturerScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecturer
        fields = ["lecturer_id", "fullname"]