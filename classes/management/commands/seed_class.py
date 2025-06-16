from django.core.management.base import BaseCommand
from classes.models import Class
from students.models import Department, Major
from subjects.models import AcademicYear
import random

def abbreviate(name):
    return ''.join(word[0].upper() for word in name.split() if word)

def abbreviate_department(department_name):
    if department_name.lower().startswith('khoa '):
        department_name = department_name[5:]
    return ''.join(word[0].upper() for word in department_name.split() if word)

def get_year_short(academic_year_name):
    start_year, end_year = academic_year_name.split('-')
    return start_year[-2:] + end_year[-2:]

def generate_class_name(department_name, major_name, academic_year_name):
    dept_abbr = abbreviate_department(department_name)
    major_abbr = abbreviate(major_name)
    year_short = get_year_short(academic_year_name)
    rand_num = f"{random.randint(0, 999):03d}"
    return f"{dept_abbr}{major_abbr}{year_short}{rand_num}"

class Command(BaseCommand):
    help = 'Seed classes data for each major and academic year'

    def handle(self, *args, **options):
        departments = Department.objects.all()
        academic_years = AcademicYear.objects.all()

        total_created = 0
        for department in departments:
            majors = Major.objects.filter(department=department)
            for major in majors:
                for academic_year in academic_years:
                    for _ in range(10):
                        class_name = generate_class_name(department.department_name, major.major_name, academic_year.academic_year_name)
                        obj, created = Class.objects.get_or_create(
                            department=department,
                            academic_year=academic_year,
                            class_name=class_name
                        )
                        if created:
                            total_created += 1
                            self.stdout.write(self.style.SUCCESS(f'Created class: {class_name}'))
                        else:
                            self.stdout.write(f'Class {class_name} already exists')

        self.stdout.write(self.style.SUCCESS(f'Total classes created: {total_created}'))
