import random
from django.core.management.base import BaseCommand
from lecturers.models import Lecturer, LecturerSubject
from students.models import Subject

class Command(BaseCommand):
    help = "Seed LecturerSubject: each lecturer teaches 4 random subjects"

    def handle(self, *args, **options):
        lecturers = list(Lecturer.objects.all())
        subjects = list(Subject.objects.filter(academic_year_id=5))

        if not lecturers:
            self.stdout.write(self.style.ERROR("No lecturers found. Please seed lecturers first."))
            return

        if not subjects:
            self.stdout.write(self.style.ERROR("No subjects found. Please seed subjects first."))
            return

        for lecturer in lecturers:
            assigned_subjects = random.sample(subjects, min(4, len(subjects)))

            for subject in assigned_subjects:
                if LecturerSubject.objects.filter(lecturer=lecturer, subject=subject).exists():
                    continue

                LecturerSubject.objects.create(
                    lecturer=lecturer,
                    subject=subject
                )

            self.stdout.write(self.style.SUCCESS(
                f"Assigned 4 subjects to lecturer {lecturer.fullname} ({lecturer.account.email})"
            ))

        self.stdout.write(self.style.SUCCESS("Lecturer-Subject seeding complete."))