from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LeaveRequestRawView, LeaveRequestViewSet, ListSubjectsLeaveRequestView, LecturerReceivedLeaveRequestsView, approve_leave_request, reject_leave_request
)

router = DefaultRouter()
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')

urlpatterns = [
    # API Get data to show leave request form
    path(
        'leave-requests/<int:account_id>/<int:subject_id>/',
        LeaveRequestRawView.as_view(),
        name='get-data-to-leave-request'
    ),

    # API List subjects leave request
    path(
        'leave-requests/list-subjects/<int:account_id>/',
        ListSubjectsLeaveRequestView.as_view(),
        name='list-subjects-leave-request'
    ),

    # API CRUD for LeaveRequest
    path('', include(router.urls)),
    
    path(
    'leave-requests/lecturer/<int:lecturer_id>/',LecturerReceivedLeaveRequestsView.as_view(),name='lecturer-received-leave-requests',
),
    path('leave-requests/<int:pk>/approve/', approve_leave_request, name='approve_leave_request'),
    path('leave-requests/<int:pk>/reject/', reject_leave_request, name='reject_leave_request'),
    
]