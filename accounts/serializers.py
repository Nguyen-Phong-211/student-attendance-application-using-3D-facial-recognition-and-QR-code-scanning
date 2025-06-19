from rest_framework import serializers
from accounts.models import Account, Role
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from accounts.models import Account 
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

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
        
        if account.is_locked:
            raise serializers.ValidationError("Tài khoản của bạn bị khoá. Vui lòng liên hệ với quản trị hệ thống.")

        data['user'] = account
        return data
    
class AccountListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['account_id', 'email', 'is_active', 'phone_number', 'is_locked']
        
class AccountResetPassword(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(min_length=8)
    
    def validate_email(self, value):
        try:
            account = Account.objects.get(email=value)
            if not hasattr(account, 'student'):
                raise serializers.ValidationError("Email không thuộc về sinh viên.")
            return value
        except Account.DoesNotExist:
            raise serializers.ValidationError("Tài khoản với email này không tồn tại.")

    def save(self):
        email = self.validated_data['email']
        new_password = self.validated_data['new_password']
        account = Account.objects.get(email=email)

        account.set_password(new_password)
        account.save()

        subject = 'Reset Password'
        from_email = 'zephyrnguyen.vn@gmail.com'
        to = [email]

        html_content = render_to_string('account/reset_password.html', {'new_password': new_password})
        text_content = f'Mật khẩu mới của bạn là: {new_password}'

        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        return account
    
