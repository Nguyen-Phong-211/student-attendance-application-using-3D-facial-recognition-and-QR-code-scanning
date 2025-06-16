import random
from django.core.management.base import BaseCommand
from rooms.models import Room

class Command(BaseCommand):
    help = 'Seed rooms with latitude and longitude into the database'

    def handle(self, *args, **options):
        base_latitude = 10.8700
        base_longitude = 106.8030

        rooms = [
            'A1.01', 'A1.02', 'A1.03', 'A1.04', 'A1.05', 'A1.06', 'A1.07', 'A1.08', 'A1.09', 'A1.10',
            'A2.01', 'A2.02', 'A2.03', 'A2.04', 'A2.05', 'A2.06', 'A2.07', 'A2.08', 'A2.09', 'A2.10',
            'A3.01', 'A3.02', 'A3.03', 'A3.04', 'A3.05', 'A3.06', 'A3.07', 'A3.08', 'A3.09', 'A3.10',
            'A4.01', 'A4.02', 'A4.03', 'A4.04', 'A4.05', 'A4.06', 'A4.07', 'A4.08', 'A4.09', 'A4.10',
            'A5.01', 'A5.02', 'A5.03', 'A5.04', 'A5.05', 'A5.06', 'A5.07', 'A5.08', 'A5.09', 'A5.10',
        ]

        for room in rooms:
            latitude = round(base_latitude + random.uniform(-0.0005, 0.0005), 6)
            longitude = round(base_longitude + random.uniform(-0.0005, 0.0005), 6)

            if room.startswith("A5."):
                room_type = "Thực hành"
                capacity = 30
            else:
                room_type = "Lý thuyết"
                capacity = 70

            obj, created = Room.objects.get_or_create(
                room_name=room,
                defaults={
                    'latitude': latitude,
                    'longitude': longitude,
                    'room_type': room_type,
                    'capacity': capacity,
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Created room {room} ({room_type}, {capacity})'))
            else:
                self.stdout.write(f'Room {room} already exists -> skipped')