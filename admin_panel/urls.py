from django.urls import path
from .views.student_views import get_all_students

urlpatterns = [
    path('students/', get_all_students, name='get_all_students'),
]