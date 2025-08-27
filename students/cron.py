from datetime import timedelta
from django.utils.timezone import now
from .models import SubjectRegistrationRequest, StudentSubject
from subjects.models import Subject

def auto_approve_requests():
    pending_requests = SubjectRegistrationRequest.objects.filter(
        status="pending",
        created_at__lte=now() - timedelta(hours=24)
    )

    for req in pending_requests:
        subject = Subject.objects.get(id=req.subject_id)

        if subject.credits == 1:
            total_sessions = 15
        elif subject.credits == 2:
            total_sessions = 15
        else:
            total_sessions = (subject.credits * 15) // 3

        max_leave_days = int(total_sessions * 0.3)

        req.status = "approved"
        req.save()

        StudentSubject.objects.get_or_create(
            student=req.student,
            subject=subject,
            defaults={"max_leave_days": max_leave_days}
        )