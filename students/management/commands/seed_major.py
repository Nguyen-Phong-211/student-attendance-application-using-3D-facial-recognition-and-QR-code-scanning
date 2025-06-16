from django.core.management.base import BaseCommand
from students.models import Major, Department

class Command(BaseCommand):
    help = 'Seed majors into the database'

    def handle(self, *args, **options):
        data = {
            'Khoa Công nghệ thông tin': [
                'Kỹ thuật phần mềm',
                'Hệ thống thông tin',
                'Mạng máy tính',
                'Khoa học dữ liệu',
                'Trí tuệ nhân tạo'
            ],
            'Khoa Khoa học cơ bản': [
                'Toán học',
                'Vật lý',
                'Hóa học',
                'Sinh học',
                'Khoa học môi trường'
            ],
            'Khoa Ngoại ngữ': [
                'Ngôn ngữ Anh',
                'Ngôn ngữ Trung',
                'Ngôn ngữ Nhật',
                'Ngôn ngữ Hàn',
                'Ngôn ngữ Pháp'
            ],
            'Khoa Quản trị kinh doanh': [
                'Quản trị doanh nghiệp',
                'Marketing',
                'Tài chính ngân hàng',
                'Kế toán',
                'Logistics'
            ],
            'Khoa Kỹ thuật xây dựng': [
                'Xây dựng dân dụng',
                'Xây dựng công nghiệp',
                'Cầu đường',
                'Quản lý xây dựng',
                'Kỹ thuật hạ tầng'
            ],
            'Khoa Cơ khí': [
                'Kỹ thuật cơ khí',
                'Cơ điện tử',
                'Kỹ thuật nhiệt',
                'Chế tạo máy',
                'Tự động hóa'
            ],
            'Khoa Thiết kế thời trang': [
                'Thiết kế thời trang',
                'Thiết kế đồ họa',
                'Thiết kế nội thất',
                'Mỹ thuật công nghiệp',
                'Thiết kế trang sức'
            ],
            'Khoa Công nghệ ô tô': [
                'Công nghệ ô tô',
                'Kỹ thuật động cơ',
                'Điện ô tô',
                'Bảo trì ô tô',
                'Chẩn đoán ô tô'
            ]
        }

        for dept_name, majors in data.items():
            try:
                department = Department.objects.get(department_name=dept_name)
            except Department.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Department "{dept_name}" does not exist.'))
                continue

            for major_name in majors:
                obj, created = Major.objects.get_or_create(
                    major_name=major_name,
                    department=department,
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created major "{major_name}" in department "{dept_name}"'))
                else:
                    self.stdout.write(f'Major "{major_name}" already exists in department "{dept_name}"')
