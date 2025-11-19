from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Contact
from students.models import Student
from accounts.models import Account
from lecturers.models import Lecturer, LecturerSubject
from staffs.models import Staff
from subjects.models import Subject

# ==============================
# Add contact serializer
# ==============================
class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = [
            'contact_id', 'contact_code', 'fullname', 'email', 'phone_number',
            'type_person_contact', 'from_person', 'to_person_type', 'to_person_id',
            'subject', 'message', 'status', 'status_response', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'contact_code', 'status', 'status_response', 'created_at',
            'updated_at', 'fullname', 'email', 'phone_number',
            'from_person', 'to_person_type', 'to_person_id'
        ]

    def create(self, validated_data):
        from_person = validated_data.get('from_person')
        type_person_contact = validated_data.get('type_person_contact')
        subject = validated_data.get('subject')

        # --- Assign from person ---
        student = Student.objects.select_related('account').get(pk=from_person.student_id)
        account = student.account
        validated_data['fullname'] = student.fullname
        validated_data['email'] = account.email
        validated_data['phone_number'] = account.phone_number

        # --- Assign to person ---
        if type_person_contact == Contact.TypePersonContact.LECTURER:
            if not subject:
                raise serializers.ValidationError("Subject is required for lecturer contact.")

            # Query lecturer following the subject and get the first one
            lecturer_subject = LecturerSubject.objects.filter(subject=subject).select_related('lecturer').first()
            if not lecturer_subject:
                raise serializers.ValidationError("No lecturer found for this subject.")

            lecturer = lecturer_subject.lecturer
            validated_data['to_person_type'] = ContentType.objects.get_for_model(Lecturer)
            validated_data['to_person_id'] = lecturer.lecturer_id

        elif type_person_contact == Contact.TypePersonContact.ADMIN:
            staff = Staff.objects.first()
            if not staff:
                raise serializers.ValidationError("No admin staff found.")
            validated_data['to_person_type'] = ContentType.objects.get_for_model(Staff)
            validated_data['to_person_id'] = staff.staff_id

        else:
            raise serializers.ValidationError("Invalid contact type.")

        return super().create(validated_data)
#TRANG
# serializers.py

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'

    def create(self, validated_data):
        # Người gửi là lecturer
        from_person = validated_data.pop('from_person', None)
        student_id = validated_data.pop('student_id', None)

        # Lấy đối tượng Student từ payload
        student = None
        if student_id:
            student = Student.objects.get(pk=student_id)

        contact = Contact.objects.create(
            from_person=from_person,
            to_student=student,
            **validated_data
        )
        return contact

