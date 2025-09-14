from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveRequestRawView, LeaveRequestViewSet

router = DefaultRouter()
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')

urlpatterns = [
    # API Get data to show leave request form
    path(
        'leave-request/<int:account_id>/<int:subject_id>/<int:academic_year_id>/<int:semester_id>/',
        LeaveRequestRawView.as_view(),
        name='get-data-to-leave-request'
    ),

    # API CRUD for LeaveRequest
    path('', include(router.urls)),
]