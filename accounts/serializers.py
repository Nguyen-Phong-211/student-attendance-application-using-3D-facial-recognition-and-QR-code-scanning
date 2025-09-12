from rest_framework import serializers
from accounts.models import Account, Role
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from accounts.models import Account 
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
import hashlib, secrets
from django.utils import timezone
from datetime import timedelta

OTP_STORE = {}

def generate_otp(length=6):
    return ''.join(secrets.choice("0123456789") for _ in range(length))

def hash_otp(otp):
    return hashlib.sha256(otp.encode()).hexdigest()

# Account List
class AccountInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['email', 'phone_number', 'email']

# Signup
class AccountSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())

    class Meta:
        model = Account
        fields = ['account_id', 'role', 'email', 'password', 'phone_number', 'user_type']
        extra_kwargs = {
            'password': {'write_only': True},
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
# End signup

# Login
class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=10)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        phone_number = data.get('phone_number')
        password = data.get('password')

        try:
            account = Account.objects.get(phone_number=phone_number)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Tài khoản không tồn tại. Vui lòng đăng ký tài khoản.")

        if account.is_locked:
            raise serializers.ValidationError(
                "Tài khoản của bạn bị khoá. Vui lòng liên hệ với quản trị hệ thống."
            )

        if not account.check_password(password):
            raise serializers.ValidationError("Vui lòng kiểm tra lại thông tin")

        data['user'] = account
        return data
# End login

# ================================ Get all accounts ================================ #
class AccountListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['account_id', 'email', 'is_active', 'phone_number', 'is_locked', 'user_type']
# ================================ End get all accounts ============================ #
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
    
# Reset password for lecturer
class AccountResetPasswordLecturer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(min_length=8)
    
    def validate_email(self, value):
        try:
            account = Account.objects.get(email=value)
            if not hasattr(account, 'lecturer'):
                raise serializers.ValidationError("Email không thuộc về giảng viên.")
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

# =================== CHANGE PASSWORD ================== #
class RequestOTPChangePasswordSerializer(serializers.Serializer):
    """
    B1: Người dùng gửi email/phone để nhận OTP đổi mật khẩu
    """
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            Account.objects.get(email=value)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Email không tồn tại.")
        return value

    def save(self):
        email = self.validated_data["email"]
        otp = generate_otp()
        otp_hash = hash_otp(otp)
        OTP_STORE[email] = {
            "otp_hash": otp_hash,
            "expires_at": timezone.now() + timedelta(minutes=5),
            "attempts": 0
        }

        # Gửi email OTP
        subject = "OTP đổi mật khẩu"
        from_email = "zephyrnguyen.vn@gmail.com"
        to = [email]
        text_content = f"Mã OTP của bạn là: {otp}. OTP có hiệu lực trong 5 phút."

        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.send()

        return {"detail": "OTP đã được gửi tới email của bạn."}


class VerifyOTPChangePasswordSerializer(serializers.Serializer):
    """
    B2: Người dùng nhập email + otp + mật khẩu mới để đổi password
    """
    email = serializers.EmailField()
    otp = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        email = attrs.get("email")
        otp = attrs.get("otp")
        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")

        if new_password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Mật khẩu xác nhận không khớp."})

        otp_data = OTP_STORE.get(email)
        if not otp_data:
            raise serializers.ValidationError({"otp": "Chưa yêu cầu OTP hoặc OTP không hợp lệ."})

        if timezone.now() > otp_data["expires_at"]:
            raise serializers.ValidationError({"otp": "OTP đã hết hạn."})

        if otp_data["attempts"] >= 5:
            raise serializers.ValidationError({"otp": "Bạn đã nhập sai OTP quá nhiều lần."})

        if hash_otp(otp) != otp_data["otp_hash"]:
            otp_data["attempts"] += 1
            OTP_STORE[email] = otp_data
            raise serializers.ValidationError({"otp": "OTP không chính xác."})

        # validate password bằng Django
        try:
            validate_password(new_password)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        return attrs

    def save(self):
        email = self.validated_data["email"]
        new_password = self.validated_data["new_password"]
        account = Account.objects.get(email=email)

        account.set_password(new_password)
        account.save()

        # đánh dấu OTP đã dùng
        if email in OTP_STORE:
            del OTP_STORE[email]

        return account
# =================== END CHANGE PASSWORD ================== #
