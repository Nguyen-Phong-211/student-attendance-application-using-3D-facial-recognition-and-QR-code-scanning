from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Run all seed commands in order'

    SEED_COMMANDS = [
        'seed_role',
        'seed_permissions',
        'seed_room',
        'seed_department',
        'seed_major',
        'seed_academic_year',
        'seed_semester',
        'seed_class',
        'seed_subject',
        'seed_shift',
        'seed_lesson_slot',
        'seed_lecturers',
        'seed_lecturer_subjects',
        'seed_subject_classes',
        'seed_students',
        'seed_schedule',
    ]

    def handle(self, *args, **kwargs):
        for command_name in self.SEED_COMMANDS:
            self.stdout.write(self.style.NOTICE(f"Running {command_name}..."))
            try:
                call_command(command_name)
                self.stdout.write(self.style.SUCCESS(f"{command_name} completed."))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error running {command_name}: {e}"))
                raise CommandError(f"Seeding failed at {command_name}")
        
        self.stdout.write(self.style.SUCCESS("All seed commands executed successfully."))