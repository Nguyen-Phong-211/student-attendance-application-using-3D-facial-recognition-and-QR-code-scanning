from django.urls import path
from .views import CreateStudentView, DepartmentListAPIView, MajorListAPIView, StudentListView, AllStudentGetListView, create_student, MajorUpdateAPIView

urlpatterns = [
    path('students/', CreateStudentView.as_view(), name='create_student'),
    path('departments/all/', DepartmentListAPIView.as_view(), name='get-list-department'),
    path('majors/all/', MajorListAPIView.as_view(), name='get-list-major'),
    path('accounts/students/all/', StudentListView.as_view(), name='get-student-by-account-id'),
    path('students/list-all/', AllStudentGetListView.as_view(), name='get-list-all-student'),
    path('students/acreated/', create_student, name='acreated-student'),
    path('majors/update/<int:pk>/', MajorUpdateAPIView.as_view(), name='major-update'),
]