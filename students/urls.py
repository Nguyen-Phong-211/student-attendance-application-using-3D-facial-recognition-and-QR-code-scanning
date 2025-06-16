from django.urls import path
from .views import CreateStudentView, DepartmentListAPIView, MajorListAPIView

urlpatterns = [
    path('api/students/', CreateStudentView.as_view(), name='create_student'),
    path('api/departments/all/', DepartmentListAPIView.as_view(), name='get-list-department'),
    path('api/majors/all/', MajorListAPIView.as_view(), name='get-list-major')
]