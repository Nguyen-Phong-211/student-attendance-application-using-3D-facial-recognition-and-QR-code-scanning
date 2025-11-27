from rest_framework import serializers

class StudentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_code = serializers.CharField()
    fullname = serializers.CharField()