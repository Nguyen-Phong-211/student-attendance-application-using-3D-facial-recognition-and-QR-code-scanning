from rest_framework import serializers
from accounts.models import Account, Role
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password

class AccountSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())

    class Meta:
        model = Account
        fields = ['account_id', 'role', 'email', 'password', 'phone_number', 'reset_token', 'user_type']
        extra_kwargs = {
            'password': {'write_only': True},
            'reset_token': {'required': False},
            'user_type': {'read_only': True},
        }

    def validate_email(self, value):
        if Account.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã tồn tại.")
        return value

    def validate_phone_number(self, value):
        if Account.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Số điện thoại đã tồn tại.")
        return value

    def validate_role(self, value):
        if not Role.objects.filter(pk=value.pk).exists():
            raise serializers.ValidationError("Role không hợp lệ.")
        return value

    def create(self, validated_data):
        role = validated_data.get('role')
        
        if role.role_id == 3:
            validated_data['user_type'] = 'student'
        elif role.role_id == 2:
            validated_data['user_type'] = 'lecture'
        else:
            validated_data['user_type'] = 'admin'

        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=10)
    password = serializers.CharField(write_only=True)
    role = serializers.IntegerField()

    def validate(self, data):
        phone_number = data.get('phone_number')
        password = data.get('password')
        role_input = data.get('role')

        try:
            account = Account.objects.select_related('role').get(phone_number=phone_number)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Tài khoản không tồn tại")

        if account.is_locked:
            raise serializers.ValidationError("Tài khoản của bạn bị khoá. Vui lòng liên hệ với quản trị hệ thống.")

        if not account.role or account.role.role_id != role_input:
            raise serializers.ValidationError("Vai trò không đúng. Vui lòng chọn đúng vai trò.")

        if not account.check_password(password):
            raise serializers.ValidationError("Sai mật khẩu")

        data['user'] = account
        return data