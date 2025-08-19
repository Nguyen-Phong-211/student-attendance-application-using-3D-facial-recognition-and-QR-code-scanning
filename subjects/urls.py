from django.urls import path
from .views import SubjectListAPIView, AcademicYearListAPIView, SemesterListAPIView, SemesterByAcademicAPIView, DisplaySubjectForRegistionAPIView

urlpatterns = [
    path('subjects/all/', SubjectListAPIView.as_view(), name='subject-list'),
    path('academic-years/all/', AcademicYearListAPIView.as_view()),
    path('semesters/all/', SemesterListAPIView.as_view()),
    path('semesters/<int:academic_year_id>/', SemesterByAcademicAPIView.as_view()),
    path("subjects-registration/display/<int:academic_year_id>/", DisplaySubjectForRegistionAPIView.as_view(), name="display-subject-for-registration"),
]