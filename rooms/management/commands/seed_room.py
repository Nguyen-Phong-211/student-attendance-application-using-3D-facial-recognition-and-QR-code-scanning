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

            'B1.01', 'B1.02', 'B1.03', 'B1.04', 'B1.05', 'B1.06', 'B1.07', 'B1.08', 'B1.09', 'B1.10',
            'B2.01', 'B2.02', 'B2.03', 'B2.04', 'B2.05', 'B2.06', 'B2.07', 'B2.08', 'B2.09', 'B2.10',
            'B3.01', 'B3.02', 'B3.03', 'B3.04', 'B3.05', 'B3.06', 'B3.07', 'B3.08', 'B3.09', 'B3.10',
            'B4.01', 'B4.02', 'B4.03', 'B4.04', 'B4.05', 'B4.06', 'B4.07', 'B4.08', 'B4.09', 'B4.10',

            'C1.01', 'C1.02', 'C1.03', 'C1.04', 'C1.05', 'C1.06', 'C1.07', 'C1.08', 'C1.09', 'C1.10',
            'C2.01', 'C2.02', 'C2.03', 'C2.04', 'C2.05', 'C2.06', 'C2.07', 'C2.08', 'C2.09', 'C2.10',
            'C3.01', 'C3.02', 'C3.03', 'C3.04', 'C3.05', 'C3.06', 'C3.07', 'C3.08', 'C3.09', 'C3.10',
            'C4.01', 'C4.02', 'C4.03', 'C4.04', 'C4.05', 'C4.06', 'C4.07', 'C4.08', 'C4.09', 'C4.10',
            'C5.01', 'C5.02', 'C5.03', 'C5.04', 'C5.05', 'C5.06', 'C5.07', 'C5.08', 'C5.09', 'C5.10',
            'C6.01', 'C6.02', 'C6.03', 'C6.04', 'C6.05', 'C6.06', 'C6.07', 'C6.08', 'C6.09', 'C6.10',
            'C7.01', 'C7.02', 'C7.03', 'C7.04', 'C7.05', 'C7.06', 'C7.07', 'C7.08', 'C7.09', 'C7.10',
            'C8.01', 'C8.02', 'C8.03', 'C8.04', 'C8.05', 'C8.06', 'C8.07', 'C8.08', 'C8.09', 'C8.10',

            'A5.01', 'A5.02', 'A5.03', 'A5.04', 'A5.05', 'A5.06', 'A5.07', 'A5.08', 'A5.09', 'A5.10',
            'B5.01', 'B5.02', 'B5.03', 'B5.04', 'B5.05', 'B5.06', 'B5.07', 'B5.08', 'B5.09', 'B5.10',
            'B6.01', 'B6.02', 'B6.03', 'B6.04', 'B6.05', 'B6.06', 'B6.07', 'B6.08', 'B6.09', 'B6.10',
            'B7.01', 'B7.02', 'B7.03', 'B7.04', 'B7.05', 'B7.06', 'B7.07', 'B7.08', 'B7.09', 'B7.10',
            'B8.01', 'B8.02', 'B8.03', 'B8.04', 'B8.05', 'B8.06', 'B8.07', 'B8.08', 'B8.09', 'B8.10',
        ]

        for room in rooms:
            latitude = round(base_latitude + random.uniform(-0.0005, 0.0005), 6)
            longitude = round(base_longitude + random.uniform(-0.0005, 0.0005), 6)

            if (room.startswith("A5.") or 
                room.startswith("B5.") or 
                room.startswith("B6.") or 
                room.startswith("B7.") or 
                room.startswith("B8.")):
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