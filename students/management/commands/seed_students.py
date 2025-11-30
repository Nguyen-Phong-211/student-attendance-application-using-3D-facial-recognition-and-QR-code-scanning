# students/management/commands/seed_students.py

import random
import uuid
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from students.models import Student, Major, Department
from accounts.models import Account


EMAILS = [
    "2003.nhatcuong@gmail.com",
    "thanhduocok25122003@gmail.com",
    "levietduc16@gmail.com",
    "doanmailinh03@gmail.com",
    "halengoc27@gmail.com",
    "1tuananhtran1@gmail.com",
    "ngalethi132@gmail.com",
    "tranletruongvu12a192021@gmail.com",
    "tranvietquan02102003@gmail.com",
    "tuanvuongpokap@gmail.com",
    "quynhhuong955711@gmail.com",
    "ntma945@gmail.com",
    "nguyenthiphuongtrinh2508@gmail.com"
]

# các đầu số hợp lệ
PHONE_PREFIXES = [
    "096","097","086","098","039","038","037","036","035","034","033","032",
    "083","084","085","081","088","082","091","094","070","076","077","078",
    "079","089","090","093","092","056","058","099","059","087"
]

GENDERS = ["M", "F"]

class Command(BaseCommand):
    help = "Seed students with random major, department, phone, and account."

    def handle(self, *args, **options):
        majors = list(Major.objects.select_related("department").all())
        if not majors:
            self.stdout.write(self.style.ERROR("No Major found in DB. Please seed majors first."))
            return

        created_count = 0

        for email in EMAILS:
            # tạo account
            phone = f"{random.choice(PHONE_PREFIXES)}{random.randint(1000000, 9999999)}"
            password = str(uuid.uuid4())

            account, created = Account.objects.get_or_create(
                email=email,
                defaults={
                    "phone_number": phone,
                    "user_type": Account.UserType.STUDENT,
                    "is_active": True,
                    "is_verified_email": True,
                    "is_staff": False,
                }
            )
            if created:
                account.set_password(password)
                account.save()

            # chọn major random
            major = random.choice(majors)
            department = major.department

            # tạo sinh viên
            fullname = email.split("@")[0].replace(".", " ").title()
            dob = datetime(year=random.randint(2000, 2005), month=random.randint(1,12), day=random.randint(1,28))

            student, created_student = Student.objects.get_or_create(
                account=account,
                defaults={
                    "fullname": fullname,
                    "department": department,
                    "major": major,
                    "dob": dob,
                    "gender": random.choice(GENDERS),
                    "status": Student.Status.ACTIVE,
                    "student_code": str(uuid.uuid4())[:15]
                }
            )

            created_count += 1
            self.stdout.write(self.style.SUCCESS(f"Created Student: {fullname}, Email: {email}, Phone: {phone}"))

        self.stdout.write(self.style.SUCCESS(f"Done! Created {created_count} students."))