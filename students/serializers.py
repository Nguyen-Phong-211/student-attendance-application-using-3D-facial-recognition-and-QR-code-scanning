from rest_framework import serializers
from .models import Department, Major
from .models import Student
import base64
import uuid
from django.core.files.base import ContentFile
from rest_framework import serializers
from accounts.models import Account
from accounts.serializers import AccountListSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['department_id', 'department_name']

class StudentSerializer(serializers.ModelSerializer):
    avatar_base64 = serializers.CharField(write_only=True, required=False)
    account_id = serializers.IntegerField(write_only=True, required=False)
    class Meta:
        model = Student
        fields = '__all__'
        extra_kwargs = {
            'account': {'read_only': True} 
        }

    def create(self, validated_data):
        avatar_b64 = validated_data.pop('avatar_base64', None)

        account = self.context['request'].user

        account_id = validated_data.pop('account_id', None)
        if account_id and account.account_id != account_id:
            try:
                account = Account.objects.get(account_id=account_id)
            except Account.DoesNotExist:
                raise serializers.ValidationError({"account_id": "Tài khoản không tồn tại"})

        if avatar_b64:
            if "base64," in avatar_b64:
                avatar_b64 = avatar_b64.split("base64,")[1]
            try:
                decoded_file = base64.b64decode(avatar_b64)
            except (TypeError, ValueError):
                raise serializers.ValidationError({"avatar_base64": "Ảnh không hợp lệ"})
            file_name = str(uuid.uuid4())[:12] + ".png"
            account.avatar_url.save(file_name, ContentFile(decoded_file), save=True)

        validated_data['account'] = account
        validated_data['status'] = '1'

        student = Student.objects.create(**validated_data)
        return student
    
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['department_id', 'department_name', 'department_code']
        
class MajorSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source='department.department_name')
    class Meta:
        model = Major
        fields = ['major_id', 'major_name', 'major_code', 'department']
        
class StudentGetListSerializer(serializers.ModelSerializer):
    account = AccountListSerializer(read_only=True)
    class Meta:
        model = Student 
        fields = ['student_id', 'student_code', 'fullname', 'account']

class AllStudentGetListSerializer(serializers.ModelSerializer):
    account = AccountListSerializer()
    major = MajorSerializer()
    department = DepartmentSerializer()
    class Meta:
        model = Student 
        fields = '__all__'