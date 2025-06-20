from rest_framework import serializers
import base64
import uuid
from django.core.files.base import ContentFile
from rest_framework import serializers
from accounts.models import Account
from .models import Lecturer
from accounts.serializers import AccountListSerializer

class LecturerListSerializer(serializers.ModelSerializer):
    account = AccountListSerializer(read_only=True)
    class Meta: 
        model = Lecturer
        fields = ['lecturer_id', 'fullname', 'gender', 'dob', 'lecturer_code', 'account']