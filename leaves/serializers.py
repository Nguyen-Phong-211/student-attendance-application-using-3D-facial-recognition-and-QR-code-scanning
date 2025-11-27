from rest_framework import serializers
from .models import LeaveRequest
import json, datetime, io, os, tempfile, random
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
from django.utils import timezone
from lecturers.models import Lecturer

# ==================================================
# Get data to show leave request form
# ==================================================
class LeaveRequestSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
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
    semester_start_date = serializers.DateField()
    semester_end_date = serializers.DateField()

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
            "leave_data",
            "to_target",
        ]
        read_only_fields = ["status"]

    def get_attachment_url(self, obj):
        if obj.attachment:
            return obj.attachment.url
        return None

    def create(self, validated_data):
        request = self.context.get("request")
        leave_data = validated_data.pop("leave_data", None)
        leave_request = LeaveRequest.objects.create(**validated_data)

        images_files = request.FILES.getlist("images") if "images" in request.FILES else []
        uploaded_urls = []

        if images_files:
            student_code = leave_request.student.student_code

            for img in images_files:
                ext = os.path.splitext(img.name)[1]  # .jpg, .png, ...
                random_number = ''.join(str(random.randint(0, 9)) for _ in range(10))
                now = timezone.now()
                timestamp_str = now.strftime("%H%M%S%d%m%Y")

                new_filename = f"{random_number}_{timestamp_str}_{student_code}{ext}"

                img.open()
                content = img.read()

                saved_path = default_storage.save(f"leave_attachments/{new_filename}", ContentFile(content))
                uploaded_urls.append(default_storage.url(saved_path))

            leave_request.images_urls = uploaded_urls
            leave_request.save(update_fields=["images_urls"])

        if leave_data:
            context = {
                "fullname": leave_data.get("fullname", leave_request.student.fullname),
                "student_code": leave_data.get("student_code", leave_request.student.student_code),
                "class_name": leave_data.get("class_name", ""),
                "department_name": leave_data.get("department_name", ""),
                "subject_name": leave_data.get("subject_name", leave_request.subject.subject_name),
                "semester": leave_data.get("semester_name", ""),
                "academic_year": leave_data.get("academic_year_name", ""),
                "lecturer_name": leave_data.get("lecturer_name", ""),
                "from_date": leave_request.from_date.strftime("%d/%m/%Y"), # %H:%M
                "to_date": leave_request.to_date.strftime("%d/%m/%Y"), # %H:%M
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
                "subject_name": leave_request.subject.subject_name,
                "academic_year": getattr(leave_request.academic_year, "academic_year_name", ""),
                "semester": getattr(leave_request.semester, "semester_name", ""),
                "lecturer_name": getattr(leave_request.subject.lecturer, "lecturer_name", ""),
                "from_date": leave_request.from_date.strftime("%d/%m/%Y"), # %H:%M
                "to_date": leave_request.to_date.strftime("%d/%m/%Y"), # %H:%M
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
# ==================================================
# List subjects leave request serializers
# ==================================================
class ListSubjectLeaveRequestSerializer(serializers.Serializer):
    leave_request_id = serializers.IntegerField()
    leave_request_code = serializers.UUIDField()
    reason = serializers.CharField()
    from_date = serializers.DateTimeField()
    to_date = serializers.DateTimeField()
    leave_request_status = serializers.CharField()
    rejected_reason = serializers.CharField()
    subject_name = serializers.CharField()
    max_leave_days = serializers.IntegerField()
    attachment_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    def get_attachment_url(self, obj):
        attachment = obj.get("attachment")
        if attachment:
            request = self.context.get("request")  # get the request object to get the base url
            return request.build_absolute_uri(f"{settings.MEDIA_URL}{attachment}")
        return None
    
    def get_image_url(self, obj):
        images = obj.get("images_urls")
        if images:
            if isinstance(images, str):
                try:
                    images = json.loads(images)
                except:
                    return []
            
            request = self.context.get("request")
            return [
                request.build_absolute_uri(image)
                for image in images
            ]

        return []

# ==================================================
# LECTURER: GET LIST LEAVE REQUEST SERIALIZER
# ==================================================
class LecturerLeaveRequestSerializer(serializers.Serializer):
    leave_request_id = serializers.IntegerField()
    leave_request_code = serializers.UUIDField()
    reason = serializers.CharField()
    from_date = serializers.DateTimeField()
    to_date = serializers.DateTimeField()
    status = serializers.CharField()
    rejected_reason = serializers.CharField(allow_null=True)
    reviewed_at = serializers.DateTimeField(allow_null=True)
    subject_name = serializers.CharField()
    max_leave_days = serializers.IntegerField()
    class_name = serializers.CharField()
    class_id = serializers.IntegerField()
    
    # student info
    student_id = serializers.IntegerField()
    student_code = serializers.CharField()
    fullname = serializers.CharField()

    attachment_url = serializers.SerializerMethodField()
    images_urls = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()

    def get_attachment_url(self, obj):
        attachment = obj.get("attachment")
        if not attachment:
            return None

        request = self.context.get("request")
        return request.build_absolute_uri(f"{settings.MEDIA_URL}{attachment}")

    def get_images_urls(self, obj):
        images = obj.get("images_urls")
        if not images:
            return []

        # If images is a string, convert it to a list
        if isinstance(images, str):
            try:
                images = json.loads(images)
            except:
                return []

        request = self.context.get("request")
        return [
            request.build_absolute_uri(f"{image}")
            for image in images
        ]