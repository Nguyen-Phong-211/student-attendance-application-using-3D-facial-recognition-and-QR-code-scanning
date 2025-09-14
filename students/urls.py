from django.urls import path
from .views import (
    CreateStudentView, DepartmentListAPIView, MajorListAPIView, 
    StudentListView, AllStudentGetListView, create_student, 
    MajorUpdateAPIView, StudentUpdateAPIView, SubjectRegistrationRequestCreateView, 
    SubjectRegistrationRequestListView, StudentScheduleView, StudentSubjectBySemesterView
)

urlpatterns = [
    path('students/', CreateStudentView.as_view(), name='create_student'),
    path('departments/all/', DepartmentListAPIView.as_view(), name='get-list-department'),
    path('majors/all/', MajorListAPIView.as_view(), name='get-list-major'),
    path('accounts/students/all/', StudentListView.as_view(), name='get-student-by-account-id'),
    path('students/list-all/', AllStudentGetListView.as_view(), name='get-list-all-student'),
    path('students/acreated/', create_student, name='acreated-student'),
    path('majors/update/<int:pk>/', MajorUpdateAPIView.as_view(), name='major-update'),
    path('students/<int:account_id>/', StudentUpdateAPIView.as_view(), name='student-update'),
    path('students/register-request/', SubjectRegistrationRequestCreateView.as_view(), name='register-request'),
    path('students/requests/', SubjectRegistrationRequestListView.as_view(), name='list-requests'),
    path('students/schedules/<int:account_id>/', StudentScheduleView.as_view(), name='student-schedule'),
    path(
        'students/subjects/by-semester/<int:account_id>/<int:semester_id>/',
        StudentSubjectBySemesterView.as_view(),
        name='student-subjects'
    ),
]