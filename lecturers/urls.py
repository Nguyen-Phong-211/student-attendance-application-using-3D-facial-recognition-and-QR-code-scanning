from django.urls import path
from .views import (
    LecturerListAPIView, AllLecturerView, LecturerAssignmentAPIView, 
    LecturerWithSubjectsAPIView, LecturerContactAPIView, TotalLecturerView, 
    GetScheduleLecturerView, LecturerMonthlyScheduleView, CreateQRCheckinView, GetScheduleLecturerByScheduleView, LecturerProfileView
)
from .views_dashboard import LecturerOverviewView 

urlpatterns = [
    path('all/', LecturerListAPIView.as_view(), name='get-list-all-lecturer'),
    path('assignment-class/', LecturerAssignmentAPIView.as_view(), name='lecturer-assignment'),
    path('lecturer-subject/', LecturerWithSubjectsAPIView.as_view(), name='lecturer-subject'),

    # Contact
    path('lecturer-contact/', LecturerContactAPIView.as_view(), name='lecturer-contact'),

    # Get total lecturer
    path('admin/total-lecturer/', TotalLecturerView.as_view(), name='get-total-lecturer'),
    
    # Lịch dạy của giảng viên
    path('schedules/<int:account_id>/', GetScheduleLecturerView.as_view(), name='lecturer-schedule'),
    
    path('schedules/<int:account_id>/month/', LecturerMonthlyScheduleView.as_view()),
    
    path('schedules/by-schedule/<int:schedule_id>/', GetScheduleLecturerByScheduleView.as_view(), name='get-schedule-by-id'),

    
    path("qr-checkins/", CreateQRCheckinView.as_view(), name="lecturer_qr_checkin"),
    
    # Dashboard Overview
    path("dashboard/overview/", LecturerOverviewView.as_view(), name="lecturer-dashboard-overview"),
    
    path('<int:account_id>/', LecturerProfileView.as_view(), name='lecturer-detail'),
    
]