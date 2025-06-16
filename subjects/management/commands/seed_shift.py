from django.core.management.base import BaseCommand
from subjects.models import Shift
from datetime import time
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seed default shifts (morning, afternoon, evening) into the database'

    def handle(self, *args, **options):
        shifts = [
            {
                'shift_name': 'Buổi sáng',
                'start_time': time(7, 0),
                'end_time': time(11, 0),
            },
            {
                'shift_name': 'Buổi chiều',
                'start_time': time(13, 0),
                'end_time': time(17, 0),
            },
            {
                'shift_name': 'Buổi tối',
                'start_time': time(18, 0),
                'end_time': time(21, 0),
            },
        ]

        for shift_data in shifts:
            obj, created = Shift.objects.get_or_create(
                shift_name=shift_data['shift_name'],
                defaults={
                    'start_time': shift_data['start_time'],
                    'end_time': shift_data['end_time'],
                    'status': '1',
                    'created_at': timezone.now()
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✔ Created shift: {shift_data['shift_name']}"))
            else:
                self.stdout.write(f"ℹ Shift already exists: {shift_data['shift_name']}")