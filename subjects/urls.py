from django.urls import path
from .views import (
    SubjectListAPIView, AcademicYearListAPIView, SemesterListAPIView, 
    SemesterByAcademicAPIView, DisplaySubjectForRegistionAPIView, StudentSubjectView,
)

urlpatterns = [
    path('subjects/all/', SubjectListAPIView.as_view(), name='subject-list'),
    path('academic-years/all/', AcademicYearListAPIView.as_view()),
    path('semesters/all/', SemesterListAPIView.as_view()),
    path('semesters/<int:academic_year_id>/', SemesterByAcademicAPIView.as_view()),
    path("subjects-registration/display/<int:academic_year_id>/", DisplaySubjectForRegistionAPIView.as_view(), name="display-subject-for-registration"),

    # Get all subject of student view
    path('subjects/student-subjects/<int:account_id>/', StudentSubjectView.as_view(), name='student-subjects'), 
    
    #  # Thêm dòng này để lấy môn học theo lớp
    #path('classes/<int:class_id>/subjects/', GetSubjectByClassView.as_view(), name='class-subjects'),

]