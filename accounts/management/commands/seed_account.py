from django.core.management.base import BaseCommand
from accounts.models import Account
from django.contrib.auth.models import Permission, Group
import os

class Command(BaseCommand):
    help = "Seed 2 admin accounts into the database with is_staff=True, is_superuser=True"

    def handle(self, *args, **options):
        admins = [
            {
                "email": os.environ.get("ADMIN1_EMAIL"),
                "phone_number": os.environ.get("ADMIN1_PHONE"),
                "password": os.environ.get("ADMIN1_PASSWORD"),
                "user_type": "admin",
            },
            {
                "email": os.environ.get("ADMIN2_EMAIL"),
                "phone_number": os.environ.get("ADMIN2_PHONE"),
                "password": os.environ.get("ADMIN2_PASSWORD"),
                "user_type": "admin",
            }
        ]

        created_count = 0
        skipped_count = 0

        for data in admins:
            try:
                # If account already exists
                account = Account.objects.filter(email=data['email']).first()
                if account:
                    skipped_count += 1
                    self.stdout.write(
                        self.style.WARNING(f"Account {data['email']} already exists, skipped.")
                    )
                    continue

                # Create superuser
                account = Account.objects.create_superuser(
                    email=data["email"],
                    password=data["password"],
                    phone_number=data["phone_number"],
                    user_type=data["user_type"]
                )

                # Grant all permissions
                all_permissions = Permission.objects.all()
                account.user_permissions.set(all_permissions)

                # Add to admin group
                admin_group, created = Group.objects.get_or_create(name="admin")
                account.groups.add(admin_group)

                account.save()
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created admin account {data['email']}")
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Failed to create account {data['email']}: {e}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"\nDone. Created: {created_count}, Skipped: {skipped_count}")
        )