from django.urls import path
from .views import get_departments, get_major_by_department, ClassListAPIView, ClassCreateView, ClassUpdateAPIView, ScheduleListAPIView

urlpatterns = [
    path('departments/', get_departments),
    path('majors/<int:department_id>/', get_major_by_department),
    path('classes/all/', ClassListAPIView.as_view(), name='class-list'),
    path('classes/create/', ClassCreateView.as_view(), name='class-create'),
    path('classes/update/<int:pk>/', ClassUpdateAPIView.as_view(), name='class-update'),
    path('classes/schedules/<int:subject_id>/<int:semester_id>/', ScheduleListAPIView.as_view(), name='schedule-list'), # <int:semester_id>/
]