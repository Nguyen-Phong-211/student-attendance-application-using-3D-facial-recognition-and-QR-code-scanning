from django.urls import path
from .views import (
    AttendanceSummaryView, AttendanceHistoryView, AttendanceStatisticView, AttendanceStatisticTotalView,
    AttendanceStatisticByDepartmentView, AttendanceStatisticByDateCurrentSemesterView, AttendanceStatisticByClassView, 
    # LECO: Add new attendance views here
    LecturerClassesView, LecturerClassSubjectsView, StudentsByClassSubjectView, LeavePieStatsView, AttendanceByLecturerView, AttendanceStatusUpdateView
)
from . import views

urlpatterns = [
    path("attendance-summary/<int:account_id>/", AttendanceSummaryView.as_view(), name="attendance-summary"),
    path("attendance-history/<int:account_id>/", AttendanceHistoryView.as_view(), name="attendance-history"),
    path("attendance-statistics/<int:account_id>/", AttendanceStatisticView.as_view(), name="attendance-statistics"),
    # Calculate the total of attendance
    path("admin/attendance-statistics-total/", AttendanceStatisticTotalView.as_view(), name="attendance-statistics-total"),
    # Calculate the total of attendance by department
    path(
        "admin/attendance-statistics-by-department/<int:semester_id>/<int:academic_year_id>/",
        AttendanceStatisticByDepartmentView.as_view(),
        name="attendance-statistics-by-department",
    ),
    # Calculate the total of attendance by date
    path(
        "admin/attendance-statistics-by-date-current-semester/",
        AttendanceStatisticByDateCurrentSemesterView.as_view(),
        name="attendance-statistics-by-date-current-semester",
    ),
    # Calculate the total of attendance by class
    path(
        "admin/attendance-statistics-by-class/",
        AttendanceStatisticByClassView.as_view(),
        name="attendance-statistics-by-class",
    ),

    # LECTURER EXTRA ATTENDANCE URLS
    path('lecturers/classes/<int:account_id>/', LecturerClassesView.as_view(), name='lecturer-classes'),
    path('lecturers/filter/<int:class_id>/subjects/<int:account_id>/', LecturerClassSubjectsView.as_view(), name='lecturer-class-subjects'),
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
     
    # API get class and subject info
    path("classes/<int:class_id>/", views.get_class_info, name="get_class_info"),
    path("subjects/<int:subject_id>/", views.get_subject_info, name="get_subject_info"),
    path("lecturers/by-account/<int:account_id>/", views.get_lecturer_by_account, name="get_lecturer_by_account"),

    # LECO: Statistics of attendance by lecturer
    path("lecturer/filter/by/list/student/", AttendanceByLecturerView.as_view(), name="attendance-by-lecturer"),

    # LECO: Attendance status update
    path("update/status/<int:attendance_id>/", AttendanceStatusUpdateView.as_view(), name="attendance-update-status"),
]