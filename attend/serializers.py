# classes_management/serializers.py
from rest_framework import serializers

class ClassSerializer(serializers.Serializer):
    class_id = serializers.IntegerField()
    class_name = serializers.CharField()

class SubjectSerializer(serializers.Serializer):
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()

class StudentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_code = serializers.CharField()
    fullname = serializers.CharField()
