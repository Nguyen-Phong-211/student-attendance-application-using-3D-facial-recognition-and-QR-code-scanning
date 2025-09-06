from rest_framework import serializers
from .models import Department, Major
from .models import Student, SubjectRegistrationRequest
import base64
import uuid
from django.core.files.base import ContentFile
from rest_framework import serializers
from accounts.models import Account, Role
from accounts.serializers import AccountListSerializer
import random
from notifications.models import Notification
from datetime import date
import re

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
    department = DepartmentSerializer()
    
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True
    )
    class Meta:
        model = Major
        fields = ['major_id', 'major_name', 'major_code', 'department', 'department_id']
        
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
        
class StudentCreateSerializer(serializers.Serializer):
    fullname = serializers.CharField()
    phone_number = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    gender = serializers.CharField()
    dob = serializers.DateField()
    status = serializers.CharField()
    department_id = serializers.IntegerField()
    major_id = serializers.IntegerField()

    def validate_phone(self, value):
        import re
        pattern = r'^(096|097|086|098|039|038|037|036|035|034|033|032|083|084|085|081|088|082|091|094|070|076|077|078|079|089|090|093|092|056|058|099|059|087)\d{7}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError("Số điện thoại không hợp lệ.")
        return value

    def validate_dob(self, value):
        from datetime import date
        age = (date.today() - value).days // 365
        if age < 17:
            raise serializers.ValidationError("Tuổi phải lớn hơn hoặc bằng 17.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        phone_number = validated_data.pop('phone_number')
        student_role = Role.objects.get(role_id=3)

        # Create a account
        account = Account.objects.create_user(
            email=email, 
            password=password,
            role=student_role,
            phone_number=phone_number,
            user_type='student'
        )

        # Generate student code
        while True:
            code = ''.join([str(random.randint(0, 9)) for _ in range(8)])
            if not Student.objects.filter(student_code=code).exists():
                break

        # Create a student
        student = Student.objects.create(
            account=account,
            student_code=code,
            **validated_data
        )
    
        return student

# Update information
class StudentUpdateSerializer(serializers.Serializer):
    fullname = serializers.CharField(required=True)
    student_code = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    gender = serializers.CharField(required=True)
    dob = serializers.DateField(required=True)
    department_id = serializers.IntegerField(required=False)
    major_id = serializers.IntegerField(required=False)

    def validate_phone_number(self, value):
        pattern = r'^(096|097|086|098|039|038|037|036|035|034|033|032|083|084|085|081|088|082|091|094|070|076|077|078|079|089|090|093|092|056|058|099|059|087)\d{7}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError("Số điện thoại không hợp lệ.")
        return value

    def validate_dob(self, value):
        age = (date.today() - value).days // 365
        if age < 17:
            raise serializers.ValidationError("Tuổi phải lớn hơn hoặc bằng 17.")
        return value

    def update(self, account: Account, validated_data):
        """ account is instance Account """

        # update account
        account.phone_number = validated_data.get("phone_number", account.phone_number)
        account.email = validated_data.get("email", account.email)
        account.save()

        # update student (OneToOne với account)
        student = account.student  
        student.fullname = validated_data.get("fullname", student.fullname)
        student.student_code = validated_data.get("student_code", student.student_code)
        student.gender = validated_data.get("gender", student.gender)
        student.dob = validated_data.get("dob", student.dob)
        student.department_id = validated_data.get("department_id", student.department_id)
        student.major_id = validated_data.get("major_id", student.major_id)
        student.save()

        return account

# ========================= SUBJECT REGISTRATION REQUEST =========================
class SubjectRegistrationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectRegistrationRequest
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'reviewed_at', 'is_over_credit_limit', 'approved_by']

# ========================= SCHEDULE =========================
class StudentScheduleSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()
    class_id = serializers.IntegerField()
    class_name = serializers.CharField()
    subject_class_id = serializers.IntegerField()
    lecturer_name = serializers.CharField(allow_null=True)
    schedule_id = serializers.IntegerField()
    day_of_week = serializers.IntegerField()
    weekday_name = serializers.CharField()
    slot_name = serializers.CharField()
    lesson_start = serializers.TimeField()
    lesson_end = serializers.TimeField()
    occurrence_start = serializers.DateTimeField()
    occurrence_end = serializers.DateTimeField()
    room_name = serializers.CharField()
    latitude = serializers.DecimalField(max_digits=10, decimal_places=5)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=5)
    lesson_type = serializers.CharField()