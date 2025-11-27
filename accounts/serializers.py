from rest_framework import serializers
from accounts.models import Account, Role
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from accounts.models import Account 
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
import hashlib, secrets
from django.utils import timezone
from datetime import timedelta
from django.utils.crypto import get_random_string
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import re
from django.contrib.auth.models import Group

OTP_STORE = {}

# ==================================================
# OTP
# ==================================================
def generate_otp(length=6):
    return ''.join(secrets.choice("0123456789") for _ in range(length))

# ==================================================
# Hash OTP
# ==================================================
def hash_otp(otp):
    return hashlib.sha256(otp.encode()).hexdigest()

# ==================================================
# Account Information Serializer
# ==================================================
class AccountInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['email', 'phone_number', 'email']

# ==================================================
# Signup Serializer
# ==================================================
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
        role = validated_data.pop('role', None)
        
        if role.name.lower() == "student":
            validated_data['user_type'] = Account.UserType.STUDENT
        elif role.name.lower() == "lecturer":
            validated_data['user_type'] = Account.UserType.TEACHER
        elif role.name.lower() == "staff":
            validated_data['user_type'] = Account.UserType.STAFF
        else:
            validated_data['user_type'] = Account.UserType.ADMIN

        validated_data['password'] = make_password(validated_data['password'])
        account = super().create(validated_data)

        if role:
            account.groups.add(role)

        return account
# ==================================================
# Login Serializer
# ==================================================
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

        if not account.is_active:
            raise serializers.ValidationError("Tài khoản của các bản khóa. Vui lòng liên hệ với quản trị hệ thống.")

        if not account.check_password(password):
            raise serializers.ValidationError("Lỗi mật khẩu hoặc số điện thoại. Vui lòng kiểm tra lại thông tin")

        data['user'] = account
        return data
# ==================================================
# Account List
# ==================================================
class AccountListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['account_id', 'email', 'phone_number', 'is_locked', 'is_active']
# ==================================================
# Account Reset Password Student
# ==================================================
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
    
# ==================================================
# Reset Password Lecturer
# ==================================================
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

# ==================================================
# Change Password
# ==================================================
class RequestOTPChangePasswordSerializer(serializers.Serializer):
    """
    Step 1: Request OTP by providing email
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

        # send email OTP
        subject = "OTP đổi mật khẩu"
        from_email = "zephyrnguyen.vn@gmail.com"
        to = [email]
        text_content = f"Mã OTP của bạn là: {otp}. OTP có hiệu lực trong 5 phút."

        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.send()

        return {"detail": "OTP đã được gửi tới email của bạn."}


class VerifyOTPChangePasswordSerializer(serializers.Serializer):
    """
    Step 2: Verify OTP and provide new password and confirm password
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

        # Remove OTP from store
        if email in OTP_STORE:
            del OTP_STORE[email]

        return account
# ==================================================
# Send OTP for Change Password
# ==================================================
class RequestEmailChangePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            account = Account.objects.get(email=value)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Email không tồn tại trong hệ thống.")
        return value

    def save(self):
        email = self.validated_data["email"]
        account = Account.objects.get(email=email)

        otp = get_random_string(length=6, allowed_chars="0123456789")

        account.otp_code = otp
        account.otp_created_at = timezone.now()
        account.save()

        # Send email with OTP
        subject = "Mã OTP - ATTEND 3D"
        from_email = "zephyrnguyen.vn@gmail.com"
        to = [email]

        html_content = render_to_string(
            "account/otp_email.html",
            {"otp": otp, "email": email},
        )
        text_content = f"Mã OTP của bạn là: {otp}. Mã có hiệu lực trong 5 phút."

        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        return {"email": email, "otp_sent": True}
# ==================================================
# Resend OTP for Change Password
# ==================================================
class ResendOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self.user = Account.objects.get(email=value)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Email không tồn tại.")
        return value

    def save(self):
        user = self.user
        email = user.email
        otp = get_random_string(length=6, allowed_chars="0123456789")

        user.otp_code = otp
        user.otp_created_at = timezone.now()
        user.save()

        subject = "Mã OTP - ATTEND 3D"
        from_email = "zephyrnguyen.vn@gmail.com"
        to = [email]

        html_content = render_to_string(
            "account/otp_email.html",
            {"otp": otp, "email": email},
        )

        text_content = f"Mã OTP của bạn là: {otp}. Mã có hiệu lực trong 5 phút."

        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        return {"success": True, "message": "OTP mới đã được gửi qua email."}
# ==================================================
# Reset Password for Change Password
# ==================================================
class ResetPasswordForChangePassword(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        if password != confirm_password:
            raise serializers.ValidationError("Mật khẩu xác nhận không khớp.")

        if len(password) < 8 or not any(c.isdigit() for c in password) or not any(c.isalpha() for c in password):
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số.")

        return attrs

    def save(self):
        email = self.validated_data["email"]
        password = self.validated_data["password"]

        try:
            user = Account.objects.get(email=email)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Tài khoản không tồn tại.")

        # If user has not verified OTP yet
        # if hasattr(user, "is_otp_verified") and not user.is_otp_verified:
        #     raise serializers.ValidationError("OTP chưa được xác thực, không thể đổi mật khẩu.")

        # Update password
        user.password = make_password(password)
        user.otp_code = None
        user.otp_created_at = None
        if hasattr(user, "is_otp_verified"):
            user.is_otp_verified = False
        user.save()

        return {"success": True, "message": "Mật khẩu đã được đặt lại thành công."}
# ==================================================
# ADMIN: Update account (phone_number, email)
# ==================================================
class AdminUpdateAccountSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    is_active = serializers.BooleanField(required=True)

    class Meta:
        model = Account
        fields = ["phone_number", "email", "is_active"]

    def validate_phone_number(self, value):
        """
        Check if phone number is valid
        """
        pattern = re.compile(
            r"^(096|097|086|098|039|038|037|036|035|034|033|032|083|084|085|081|088|082|091|094|070|076|077|078|079|089|090|093|092|056|058|099|059|087)\d{7}$"
        )
        if not pattern.match(value):
            raise serializers.ValidationError("Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.")
        return value
# ==================================================
# ADMIN: Created account (phone_number, email, password, is_active, user_type)
# ==================================================
class AccountCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    user_type = serializers.ChoiceField(choices=Account.UserType.choices, required=True)

    class Meta:
        model = Account
        fields = [
            "email",
            "phone_number",
            "is_active",
            "user_type",
            "password",
        ]

    def validate_email(self, value):
        if Account.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email này đã tồn tại.")
        return value

    def validate_phone_number(self, value):
        if Account.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Số điện thoại này đã tồn tại.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Account.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        role_name = validated_data.get("user_type")
        if role_name:
            group, _ = Group.objects.get_or_create(name=role_name)
            user.groups.add(group)

        return user
