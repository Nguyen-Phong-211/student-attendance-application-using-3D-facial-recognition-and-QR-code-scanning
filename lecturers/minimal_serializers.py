from rest_framework import serializers
from .models import Lecturer

class LecturerScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecturer
        fields = ["lecturer_id", "fullname"]