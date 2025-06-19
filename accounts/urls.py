from django.urls import path
from .views import csrf_cookie, send_otp, verify_otp, update_avatar, LoginView, ResetPasswordView, lock_account, bulk_create_students

urlpatterns = [
    path('send_otp/', send_otp),
    path('verify_otp/', verify_otp),
    path('csrf/cookie/', csrf_cookie),  
    path('<int:account_id>/update_avatar/', update_avatar, name='update_avatar'),
    path('login/', LoginView.as_view(), name='login'),
    path('reset-password/<str:email>', ResetPasswordView.as_view(), name='admin-reset-password'),
    path('lock/<str:email>', lock_account, name='lock-account'),
    path('bulk-create-students/', bulk_create_students, name='bulk-create-students'),
]