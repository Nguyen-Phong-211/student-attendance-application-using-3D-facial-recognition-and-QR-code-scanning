from rest_framework import serializers
from .models import LeaveRequest
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io
import datetime
from django.core.files.base import ContentFile
from django.conf import settings
from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
import os
import tempfile
from django.utils import timezone
import random
from lecturers.models import Lecturer

# ==================================================
# Get data to show leave request form
# ==================================================
class LeaveRequestSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    fullname = serializers.CharField()
    student_code = serializers.CharField()
    department_name = serializers.CharField(allow_null=True)

    class_id = serializers.IntegerField()
    class_name = serializers.CharField()
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()

    lecturer_name = serializers.CharField(allow_null=True)
    lecturer_id = serializers.IntegerField(allow_null=True)

    academic_year_id = serializers.IntegerField()
    academic_year_name = serializers.CharField()
    semester_id = serializers.IntegerField()
    semester_name = serializers.CharField()
    start_date_semester = serializers.DateField()
    end_date_semester = serializers.DateField()

    schedule_id = serializers.IntegerField()
    day_of_week = serializers.IntegerField()
    room_id = serializers.IntegerField()
    room_name = serializers.CharField()
    slot_id = serializers.IntegerField()
    slot_name = serializers.CharField()
    max_leave_days = serializers.IntegerField()
# ==================================================
# Save leave request
# ==================================================
class SaveLeaveRequestSerializer(serializers.ModelSerializer):
    leave_data = serializers.JSONField(write_only=True, required=False)
    to_target = serializers.PrimaryKeyRelatedField(
        queryset=Lecturer.objects.all(),
        required=True
    )
    attachment_url = serializers.SerializerMethodField()
    class Meta:
        model = LeaveRequest
        fields = [
            "leave_request_id",
            "student",
            "subject",
            "reason",
            "from_date",
            "to_date",
            "status",
            "rejected_reason",
            "attachment_url", 
            "approved_by",
            "reviewed_at",
            "academic_year",
            "semester",
            "leave_data",
            "to_target",
        ]
        read_only_fields = ["status"]

    def get_attachment_url(self, obj):
        if obj.attachment:
            return obj.attachment.url
        return None

    def create(self, validated_data):
        leave_data = validated_data.pop("leave_data", None)
        leave_request = LeaveRequest.objects.create(**validated_data)

        # Prepare context to render
        if leave_data:
            context = {
                "fullname": leave_data.get("fullname", leave_request.student.fullname),
                "student_code": leave_data.get("student_code", leave_request.student.student_code),
                "class_name": leave_data.get("class_name", ""),
                "department_name": leave_data.get("department_name", ""),
                "academic_year": leave_data.get("academic_year_name", ""),
                "semester": leave_data.get("semester_name", ""),
                "subject_name": leave_data.get("subject_name", leave_request.subject.subject_name),
                "lecturer_name": leave_data.get("lecturer_name", ""),
                "from_date": leave_request.from_date.strftime("%d/%m/%Y %H:%M"),
                "to_date": leave_request.to_date.strftime("%d/%m/%Y %H:%M"),
                "reason": leave_request.reason,
                "today": {
                    "day": leave_request.from_date.day,
                    "month": leave_request.from_date.month,
                    "year": leave_request.from_date.year,
                },
            }
        else:
            context = {
                "fullname": leave_request.student.fullname,
                "student_code": leave_request.student.student_code,
                "class_name": "",
                "department_name": "",
                "academic_year": getattr(leave_request.academic_year, "academic_year_name", ""),
                "semester": getattr(leave_request.semester, "semester_name", ""),
                "subject_name": leave_request.subject.subject_name,
                "lecturer_name": getattr(leave_request.subject.lecturer, "lecturer_name", ""),
                "from_date": leave_request.from_date.strftime("%d/%m/%Y %H:%M"),
                "to_date": leave_request.to_date.strftime("%d/%m/%Y %H:%M"),
                "reason": leave_request.reason,
                "today": {
                    "day": leave_request.from_date.day,
                    "month": leave_request.from_date.month,
                    "year": leave_request.from_date.year,
                },
            }

        # Load HTML template
        env = Environment(loader=FileSystemLoader(os.path.join(settings.BASE_DIR, "templates", "file")))
        template = env.get_template("template_sample_leave.html")
        html_content = template.render(context)

        # Export PDF from HTML
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmpfile:
            HTML(string=html_content).write_pdf(tmpfile.name)

            random_number = ''.join([str(random.randint(0, 9)) for _ in range(15)])
            student_code = leave_request.student.student_code
            now_str = timezone.now().strftime("%Y%m%d%H%M%S")

            filename = f"{random_number}_{now_str}_{student_code}.pdf"

            with open(tmpfile.name, "rb") as f:
                leave_request.attachment.save(filename, ContentFile(f.read()), save=True)

        return leave_request