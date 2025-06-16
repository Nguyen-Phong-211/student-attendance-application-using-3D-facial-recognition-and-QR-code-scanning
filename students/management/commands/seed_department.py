from django.core.management.base import BaseCommand
from students.models import Department

class Command(BaseCommand):
    help = 'Seed department into the database'

    def handle(self, *args, **options):
        departments = ['Khoa Công nghệ thông tin', 'Khoa Khoa học cơ bản', 'Khoa Ngoại ngữ', 'Khoa Quản trị kinh doanh', 'Khoa Kỹ thuật xây dựng', 'Khoa Cơ khí', 'Khoa Thiết kế thời trang', 'Khoa Công nghệ ô tô']
        for department in departments:
            obj, created = Department.objects.get_or_create(department_name=department)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created department {department}'))
            else:
                self.stdout.write(f'Department {department} already exists')