# attend/urls.py
from django.urls import path
from .views import LecturerClassesView, LecturerClassSubjectsView, StudentsByClassSubjectView, LeavePieStatsView
from . import views

urlpatterns = [
    path('lecturers/classes/<int:account_id>/', LecturerClassesView.as_view(), name='lecturer-classes'),
    path('lecturers/classes/<int:class_id>/subjects/<int:account_id>/', LecturerClassSubjectsView.as_view(), name='lecturer-class-subjects'),
    path('classes/<int:class_id>/subjects/<int:subject_id>/students/<int:account_id>/', 
         StudentsByClassSubjectView.as_view(), 
         name='students-by-class-subject'),
    
    path("lecturers/dashboard/statistics/", views.lecturer_dashboard_statistics, name="lecturer-dashboard-statistics"),

    path(
        'lecturers/<int:account_id>/classes/<int:class_id>/subjects/<int:subject_id>/leave-stats/',
        views.LeaveRequestStatsView.as_view(),
        name='leave_request_stats'
    ),
     path(
        "lecturers/<int:account_id>/classes/<int:class_id>/subjects/<int:subject_id>/leave-pie/",
        LeavePieStatsView.as_view(),
        name="leave-pie-stats",
    ),
     
    # API lấy thông tin cho xuất Excel
    path("classes/<int:class_id>/", views.get_class_info, name="get_class_info"),
    path("subjects/<int:subject_id>/", views.get_subject_info, name="get_subject_info"),
    path("lecturers/by-account/<int:account_id>/", views.get_lecturer_by_account, name="get_lecturer_by_account"),
     
]
