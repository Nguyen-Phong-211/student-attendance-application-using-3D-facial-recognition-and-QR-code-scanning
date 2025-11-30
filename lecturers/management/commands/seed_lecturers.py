import random
import uuid
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import Account
from lecturers.models import Lecturer
from students.models import Department
from faker import Faker

fake = Faker()

LECTURER_EMAILS = [
    "lananhh621@gmail.com",
    "nguyenhoaiphat1122@gmail.com",
    "nguyenhuuphuocptap@gmail.com",
    "lengocthuy2020tg@gmail.com",
    "21124451quynh@gmail.com",
    "huynhhieuthao2521@gmail.com",
    "toan52605@gmail.com",
    "Tranvanquang12022003@gmail.com",
    "trantuankhang9685@gmail.com",
    "datpika98@gmail.com",
    "datnguyen.iclod@gmail.com",
    "hoanghanhnhibmt@gmail.com",
    "baochanh120603@gmail.com",
    "taphu1808@gmail.com",
    "thanhthaovinhlong1@gmail.com",
]

# Prefixes hợp lệ cho số điện thoại
PHONE_PREFIXES = [
    "096","097","086","098","039","038","037","036","035","034","033","032",
    "083","084","085","081","088","082","091","094","070","076","077","078",
    "079","089","090","093","092","056","058","099","059","087"
]

def generate_phone_number():
    prefix = random.choice(PHONE_PREFIXES)
    suffix = ''.join([str(random.randint(0,9)) for _ in range(7)])
    return prefix + suffix

class Command(BaseCommand):
    help = "Seed lecturer accounts and link them to Lecturer model"

    def handle(self, *args, **options):
        departments = list(Department.objects.all())
        if not departments:
            self.stdout.write(self.style.ERROR("No departments found. Please seed Department first."))
            return

        for email in LECTURER_EMAILS:
            if Account.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f"Account {email} already exists. Skipping."))
                continue

            password = uuid.uuid4().hex
            phone_number = generate_phone_number()
            account = Account.objects.create(
                email=email,
                phone_number=phone_number,
                user_type=Account.UserType.TEACHER,
                is_active=True,
            )
            account.set_password(password)
            account.save()

            fullname = fake.name()
            department = random.choice(departments)
            gender = random.choice(["M","F"])
            dob = fake.date_of_birth(minimum_age=25, maximum_age=60)
            Lecturer.objects.create(
                fullname=fullname,
                account=account,
                department=department,
                gender=gender,
                dob=dob
            )

            self.stdout.write(self.style.SUCCESS(f"Created lecturer: {email} with password {password}"))

        self.stdout.write(self.style.SUCCESS("Lecturer seeding complete."))