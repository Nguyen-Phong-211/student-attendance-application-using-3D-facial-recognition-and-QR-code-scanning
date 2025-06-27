from django.apps import AppConfig


class LecturersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lecturers'
    
    def ready(self):
        import attend3d.signals.audit_signals
