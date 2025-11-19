# # classes_management/serializers.py
# from rest_framework import serializers

# from rest_framework import serializers
# from .models import LecturerContact

# class LecturerContactSerializer(serializers.ModelSerializer):
#     from_lecturer_name = serializers.CharField(source="from_lecturer.fullname", read_only=True)
#     to_student_name = serializers.CharField(source="to_student.fullname", read_only=True)

#     class Meta:
#         model = LecturerContact
#         fields = ["id", "from_lecturer", "from_lecturer_name", "to_student", "to_student_name", "message", "created_at"]