from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
from .models import Account 
from accounts.models import Role 
from .serializers import AccountSerializer, AccountResetPassword, AccountResetPasswordLecturer
from django.middleware.csrf import get_token
import traceback
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.core.cache import cache
from .otp_storage import otp_storage
import random, string
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework import status, permissions
from .models import Account
import base64
import uuid
from django.core.files.base import ContentFile
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from .serializers import LoginSerializer
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.views.decorators.csrf import csrf_exempt
import os
from django.conf import settings
import string
from datetime import datetime
from students.models import Student
from rest_framework.permissions import AllowAny
from accounts.utils.recaptcha import verify_recaptcha
from rest_framework.permissions import IsAdminUser
from django.db.models import Q
from students.models import Department, Major
from notifications.models import Notification
from audit.models import AuditLog
from lecturers.models import Lecturer

def generate_password(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@api_view(['GET'])
@ensure_csrf_cookie
def csrf_cookie(request):
    return JsonResponse({'message': 'CSRF cookie set'})

@api_view(['POST'])
def send_otp(request):
    data = request.data
    email = data.get("email", "").strip().lower()
    phone_number = data.get('phone_number')

    if not email:
        return Response({'error': 'Email là bắt buộc'}, status=400)

    if Account.objects.filter(email=email).exists():
        return Response({'error': 'Email này đã được đăng ký'}, status=400)

    if phone_number and Account.objects.filter(phone_number=phone_number).exists():
        return Response({'error': 'Số điện thoại này đã được đăng ký'}, status=400)

    otp = f"{random.randint(100000, 999999)}"
    cache.set(email, {'otp': otp, 'data': data}, timeout=300)

    subject = 'Mã OTP từ FACE CLASS'
    from_email = 'zephyrnguyen.vn@gmail.com'
    to = [email]

    html_content = render_to_string('account/otp_email.html', {'otp': otp})
    text_content = f'Mã OTP của bạn là: {otp}'

    msg = EmailMultiAlternatives(subject, text_content, from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    return Response({'message': 'OTP đã được gửi đến email'})


# Save information of user then auth OTP
@api_view(['POST'])
def verify_otp(request):
    print(request.data)
    email = request.data.get("email", "").strip().lower()
    otp = request.data.get("otp")
    reset_token = get_token(request)

    if not email or not otp:
        return Response({'error': 'Thiếu email hoặc mã OTP'}, status=400)

    stored = cache.get(email)

    if not stored:
        print("OTP cache không tồn tại cho:", email)
        return Response({'error': 'Không tìm thấy OTP hoặc OTP đã hết hạn'}, status=400)

    if stored['otp'] != otp:
        return Response({'error': 'Mã OTP không đúng'}, status=400)

    user_data = stored['data']
    # user_data['password'] = make_password(user_data['password'])
    user_data['reset_token'] = reset_token

    serializer = AccountSerializer(data=user_data)
    if serializer.is_valid():
        account = serializer.save()

        refresh = RefreshToken.for_user(account)
        access_token = str(refresh.access_token)

        cache.delete(email)

        return Response({
            "message": "Đăng ký thành công",
            "user": {
                'account_id': account.account_id,
                'email': account.email,
                'phone_number': account.phone_number,
                'role_id': getattr(account.role, 'role_id', None),
                'reset_token': account.reset_token,
                'user_type': account.user_type,
            },
            "refresh_token": str(refresh),
            "access_token": access_token
        }, status=201)
    else:
        return Response({'error': serializer.errors}, status=400)

@csrf_exempt
@api_view(['POST'])
def update_avatar(request, account_id):
    if request.method == 'POST':
        if 'avatar' not in request.FILES:
            return JsonResponse({'error': 'Không có file avatar được gửi lên'}, status=400)

        avatar_file = request.FILES['avatar']

        avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        os.makedirs(avatar_dir, exist_ok=True)

        # Create image's name file
        random_digits = ''.join(random.choices(string.digits, k=10))
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        ext = os.path.splitext(avatar_file.name)[1]
        filename = f"avatar_{random_digits}_{timestamp}{ext}"

        filepath = os.path.join(avatar_dir, filename)

        with open(filepath, 'wb+') as destination:
            for chunk in avatar_file.chunks():
                destination.write(chunk)

        avatar_url = 'avatars/' + filename

        # Save image in database
        try:
            account = Account.objects.get(account_id=account_id)
            account.avatar_url = avatar_url 
            account.save()
        except Account.DoesNotExist:
            return JsonResponse({'error': 'Không tìm thấy tài khoản'}, status=404)

        return JsonResponse({
            'message': 'Upload avatar thành công',
            'avatar_url': settings.MEDIA_URL + avatar_url,
        })

    return JsonResponse({'error': 'Phương thức không được hỗ trợ'}, status=405)


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        
        serializer = LoginSerializer(data=request.data)
        captcha_token = request.data.get("captcha")
        
        if not captcha_token or not verify_recaptcha(captcha_token):
            return Response({'error': 'Xác minh reCAPTCHA không hợp lệ.'}, status=400)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            student_data = {}
            if hasattr(user, 'role') and user.role.role_name == "student":
                try:
                    student = user.student
                    student_data = {
                        "fullname": student.fullname,
                        "student_code": student.student_code,
                        "student_id": student.student_id
                    }
                except Exception as e:
                    student_data = {}

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "account_id": user.account_id,
                    "role": user.role.role_name if user.role else None,
                    **student_data,
                }
            })

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
class ResetPasswordView(APIView):
    def post(self, request, email):
        data = request.data.copy()
        data['email'] = email 

        serializer = AccountResetPassword(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Đặt lại mật khẩu thành công. Mật khẩu đã được gửi qua email."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Update status of account (is_locked = True -> Lock account's user)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def lock_account(request, email):
    try:
        account = Account.objects.get(email=email)
        account.is_locked = request.data.get("is_locked", True)
        account.save()
        return Response({'detail': 'Tài khoản đã được cập nhật.'})
    except Account.DoesNotExist:
        return Response({'error': 'Không tìm thấy tài khoản.'}, status=404)
    
# Update status of account (is_locked = False -> Unlock account's user)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def unlock_account(request, email):
    try:
        account = Account.objects.get(email=email)
        account.is_locked = request.data.get("is_locked", False)
        account.save()
        return Response({'detail': 'Tài khoản đã được cập nhật.'})
    except Account.DoesNotExist:
        return Response({'error': 'Không tìm thấy tài khoản.'}, status=404)
    
# Create multiple student's account when uploading .xlsx file
@api_view(['POST'])
@permission_classes([IsAdminUser]) # is_staff = True
def bulk_create_students(request):
    students = request.data.get("students", [])
    student_role = Role.objects.get(role_id=3)
    created = []

    for student in students:
        email = student.get("email")
        phone = student.get("phone")
        
        student_code = student.get("student_code")
        name = student.get("name")
        gender = student.get("gender")
        dob = student.get("dob")
        department_name = student.get("department")
        major_name = student.get("major")
        
        if not all([email, phone, name]):
            print(f"[SKIP] Missing info: {student}")
            continue

        if gender == "Nam":
            gender = '1'
        else:
            gender = '0'

        department = Department.objects.filter(department_name__iexact=department_name).first()
        if not department:
            print(f"[SKIP] Department not found: {department_name}")
            continue

        major = Major.objects.filter(major_name__iexact=major_name, department=department).first()
        if not major:
            print(f"[SKIP] Major not found or not under department {department_name}: {major_name}")
            continue

        password = generate_password()
        hashed_password = make_password(password)
        
        account = Account.objects.create(
            email=email,
            phone_number=phone,
            password=hashed_password,
            role=student_role,
            user_type='student',
        )

        Student.objects.create(
            student_code=student_code,
            fullname=name,
            gender=gender,
            dob=dob,
            account=account,
            department=department,
            major=major,
            status='1'
        )
        
        Notification.objects.create(
            title=f"Bạn đã tạo tài khoản cho sinh viên {name}",
            content=f"Sinh viên {name} đã có tài khoản trong hệ thống.",
            created_by=request.user
        )
        
        AuditLog.objects.create(
            operation='C',
            old_data={},
            new_data={
                "email": email,
                "phone_number": phone,
            },
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changed_by=request.user,
            record_id=str(account.pk),
            entity_id=str(account.pk),
            entity_name='Account',
            action_description=f"Tạo tài khoản sinh viên: {name}"
        )

        AuditLog.objects.create(
            operation='C',
            old_data={},
            new_data={
                "student_code": student_code,
                "name": name,
                "gender": gender,
                "dob": dob,
                "department": department.department_name,
                "major": major.major_name,
            },
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changed_by=request.user,
            record_id=str(account.pk),
            entity_id=str(account.pk),
            entity_name='Student',
            action_description=f"Tạo hồ sơ sinh viên: {name}"
        )

        html_content = render_to_string("account/create_multiple_account.html", {
            "name": name,
            "phone": phone,
            "password": password,
        })

        subject = "Tài khoản đăng nhập hệ thống điểm danh"
        from_email = "zephyrnguyen.vn@gmail.com"

        msg = EmailMultiAlternatives(subject, '', from_email, [email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        created.append(email)

    return Response({"created": created})

# Create multiple student's lecturer when uploading .xlsx file
@api_view(['POST'])
@permission_classes([IsAdminUser]) # is_staff = True
def bulk_create_lecturers(request):
    lecturers = request.data.get("lecturers", [])
    lecturer_role = Role.objects.get(role_id=2)
    created = []

    for lecturer in lecturers:
        email = lecturer.get("email")
        phone = lecturer.get("phone")
        
        lecturer_code = lecturer.get("lecturer_code")
        name = lecturer.get("name")
        gender = lecturer.get("gender")
        dob = lecturer.get("dob")
        department_name = lecturer.get("department")
        
        if not all([email, phone, name]):
            print(f"[SKIP] Missing info: {lecturer}")
            continue

        if gender == "Nam":
            gender = '1'
        else:
            gender = '0'

        department = Department.objects.filter(department_name__iexact=department_name).first()
        if not department:
            print(f"[SKIP] Department not found: {department_name}")
            continue

        password = generate_password()
        hashed_password = make_password(password)
        
        account = Account.objects.create(
            email=email,
            phone_number=phone,
            password=hashed_password,
            role=lecturer_role,
            user_type='lecturer',
        )

        Lecturer.objects.create(
            fullname=name,
            gender=gender,
            dob=dob,
            account=account,
            department=department,
            # status='1'
        )
        
        Notification.objects.create(
            title=f"Bạn hàng tạo tài khoản cho giảng viên {name}",
            content=f"Giảng viên {name} hàng có tài khoản trong hệ thống.",
            created_by=request.user
        )
        
        AuditLog.objects.create(
            operation='C',
            old_data={},
            new_data={
                "email": email,
                "phone_number": phone,
            },
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changed_by=request.user,
            record_id=str(account.pk),
            entity_id=str(account.pk),
            entity_name='Account',
            action_description=f"Tạo tài khoản giảng viên: {name}"
        )

        AuditLog.objects.create(
            operation='C',
            old_data={},
            new_data={
                "fullname": name,
                "gender": gender,
                "dob": dob,
                "department": department.department_name,
            },
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changed_by=request.user,
            record_id=str(account.pk),
            entity_id=str(account.pk),
            entity_name='Lecturer',
            action_description=f"Tạo hồ sơ giảng viên: {name}"
        )

        html_content = render_to_string("account/create_multiple_account.html", {
            "name": name,
            "phone": phone,
            "password": password,
        })

        subject = "Tài khoản đăng nhập hệ thống điểm danh"
        from_email = "zephyrnguyen.vn@gmail.com"

        msg = EmailMultiAlternatives(subject, '', from_email, [email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        created.append(email)

    return Response({"created": created})

class ResetPasswordLecturerView(APIView):
    def post(self, request, email):
        data = request.data.copy()
        data['email'] = email 

        serializer = AccountResetPasswordLecturer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Đặt lại mật khẩu thành công. Mật khẩu đã được gửi qua email."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)