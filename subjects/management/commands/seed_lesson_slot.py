from django.core.management.base import BaseCommand
from datetime import time
from subjects.models import LessonSlot, Shift


class Command(BaseCommand):
    help = 'Seed lesson slots (tiết học) theo các ca sáng, chiều, tối'

    def handle(self, *args, **options):
        lesson_slot_data = [
            {
                'shift_name': 'Buổi sáng',
                'slots': [
                    ('Tiết 1', time(7, 0), time(9, 0)),
                    ('Tiết 2', time(9, 15), time(11, 15)),
                ]
            },
            {
                'shift_name': 'Buổi chiều',
                'slots': [
                    ('Tiết 3', time(13, 0), time(15, 0)),
                    ('Tiết 4', time(15, 15), time(17, 15)),
                ]
            },
            {
                'shift_name': 'Buổi tối',
                'slots': [
                    ('Tiết 5', time(18, 0), time(20, 0)),
                ]
            }
        ]

        current_slot_id = 1
        LessonSlot.objects.all().delete()

        for group in lesson_slot_data:
            try:
                shift = Shift.objects.get(shift_name=group['shift_name'])
            except Shift.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"⚠️ Shift '{group['shift_name']}' không tồn tại. Bỏ qua."))
                continue

            for slot_name, start_time, end_time in group['slots']:
                duration = (
                    end_time.hour * 60 + end_time.minute
                    - start_time.hour * 60 - start_time.minute
                )

                obj, created = LessonSlot.objects.get_or_create(
                    slot_id=current_slot_id,
                    shift_id=shift,
                    slot_name=slot_name,
                    defaults={
                        'start_time': start_time,
                        'end_time': end_time,
                        'duration_minutes': duration
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created {slot_name} ({group['shift_name']})"))
                else:
                    self.stdout.write(f"{slot_name} already")

                current_slot_id += 1