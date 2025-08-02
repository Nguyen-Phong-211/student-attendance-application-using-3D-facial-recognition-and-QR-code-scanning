from django.urls import path
from .views import get_departments, get_major_by_department, ClassListAPIView, ClassCreateView, ClassUpdateAPIView

urlpatterns = [
    path('departments/', get_departments),
    path('majors/<int:department_id>/', get_major_by_department),
    path('classes/all/', ClassListAPIView.as_view(), name='class-list'),
    path('classes/create/', ClassCreateView.as_view(), name='class-create'),
    path('classes/update/<int:pk>/', ClassUpdateAPIView.as_view(), name='class-update'),
]