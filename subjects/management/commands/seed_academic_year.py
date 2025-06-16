from django.core.management.base import BaseCommand
from subjects.models import AcademicYear

class Command(BaseCommand):
    help = 'Seed AcademicYear into the database'

    def handle(self, *args, **options):
        academic_years = ['2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027', '2027-2028']
        for academic_year in academic_years:
            obj, created = AcademicYear.objects.get_or_create(academic_year_name=academic_year)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created academic_year {academic_year}'))
            else:
                self.stdout.write(f'Academic year {academic_year} already exists')