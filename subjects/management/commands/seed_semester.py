from django.core.management.base import BaseCommand
from datetime import date, timedelta
from subjects.models import AcademicYear, Semester

class Command(BaseCommand):
    help = 'Seed semesters into the database for each academic year'

    def handle(self, *args, **options):
        # Học kỳ 1: 01/09 -> 31/12
        # Học kỳ 2: 01/01 -> 31/05
        # Học kỳ hè: 01/06 -> 31/08

        semesters_info = [
            ('Học kỳ 1', (9, 1), (12, 31)),
            ('Học kỳ 2', (1, 1), (5, 31)),
            ('Học kỳ hè', (6, 1), (8, 31)),
        ]

        academic_years = AcademicYear.objects.all()
        for ay in academic_years:
            start_year_str, end_year_str = ay.academic_year_name.split('-')
            start_year = int(start_year_str)
            end_year = int(end_year_str)

            for semester_prefix, (start_month, start_day), (end_month, end_day) in semesters_info:
                semester_name = f"{semester_prefix} {ay.academic_year_name}"

                if semester_prefix == 'Học kỳ 1':
                    start_date = date(start_year, start_month, start_day)
                    end_date = date(start_year, end_month, end_day)
                elif semester_prefix == 'Học kỳ 2':
                    start_date = date(end_year, start_month, start_day)
                    end_date = date(end_year, end_month, end_day)
                else:  
                    start_date = date(end_year, start_month, start_day)
                    end_date = date(end_year, end_month, end_day)

                obj, created = Semester.objects.get_or_create(
                    semester_name=semester_name,
                    academic_year=ay,
                    defaults={
                        'start_date': start_date,
                        'end_date': end_date,
                        'status': '1',
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created semester {semester_name}'))
                else:
                    self.stdout.write(f'Semester {semester_name} already exists')
