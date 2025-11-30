import random
from django.core.management.base import BaseCommand
from subjects.models import Semester
from classes.models import Class
from lecturers.models import SubjectClass, LecturerSubject

class Command(BaseCommand):
    help = "Seed SubjectClass for academic_year_id=5, unique records only"

    def handle(self, *args, **options):
        # Lấy tất cả LecturerSubject
        lecturer_subjects = list(LecturerSubject.objects.all())
        if not lecturer_subjects:
            self.stdout.write(self.style.ERROR("No LecturerSubject found. Seed them first."))
            return

        # Lấy semester thuộc academic_year_id=5
        semesters = list(Semester.objects.filter(academic_year_id=5))
        if not semesters:
            self.stdout.write(self.style.ERROR("No Semester found for academic_year_id=5."))
            return

        # Lấy tất cả class
        classes = list(Class.objects.filter(academic_year_id=5))
        if not classes:
            self.stdout.write(self.style.ERROR("No Class found for academic_year_id=5."))
            return

        created_count = 0

        for ls in lecturer_subjects:
            # Chọn random class
            random_class = random.choice(classes)
            # Chọn random semester
            random_semester = random.choice(semesters)

            # Kiểm tra xem record này đã tồn tại chưa
            exists = SubjectClass.objects.filter(
                subject=ls.subject,
                lecturer=ls.lecturer,
                class_id=random_class,
                semester=random_semester
            ).exists()

            if exists:
                continue  # Bỏ qua nếu trùng

            # Tạo record mới
            SubjectClass.objects.create(
                subject=ls.subject,
                lecturer=ls.lecturer,
                class_id=random_class,
                semester=random_semester
            )
            created_count += 1
            self.stdout.write(self.style.SUCCESS(
                f"Created SubjectClass: {ls.subject.subject_name} - {ls.lecturer.fullname} - {random_class.class_name} - {random_semester.semester_name}"
            ))

        self.stdout.write(self.style.SUCCESS(f"Seeding complete. {created_count} records created."))