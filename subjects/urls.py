from django.urls import path
from .views import SubjectListAPIView, AcademicYearListAPIView

urlpatterns = [
    path('subjects/all/', SubjectListAPIView.as_view(), name='subject-list'),
    path('academic-years/all/', AcademicYearListAPIView.as_view())
]