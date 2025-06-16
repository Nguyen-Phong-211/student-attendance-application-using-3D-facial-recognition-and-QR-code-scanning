from django.core.management.base import BaseCommand
from accounts.models import Role
import random

class Command(BaseCommand):
    help = 'Seed roles into the database'

    def handle(self, *args, **options):
        roles = ['admin', 'lecturer', 'student']
        for role in roles:
            obj, created = Role.objects.get_or_create(role_name=role)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role {role}'))
            else:
                self.stdout.write(f'Role {role} already exists')