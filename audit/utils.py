import threading
import json
from decimal import Decimal
from django.db.models import FileField

_local = threading.local()

def set_current_request(request):
    _local.request = request

def get_current_request():
    return getattr(_local, "request", None)

def get_current_user():
    request = get_current_request()
    if request and hasattr(request, "user") and request.user.is_authenticated:
        return request.user
    return None

def clear_current_request():
    if hasattr(_local, "request"):
        del _local.request

def safe_model_to_dict(instance):
    """Convert model to dict with JSON-safe values."""
    from django.forms.models import model_to_dict

    data = model_to_dict(instance)

    for field in instance._meta.fields:
        field_name = field.name
        value = getattr(instance, field_name, None)

        if isinstance(field, FileField):
            data[field_name] = value.url if value else None
        elif hasattr(value, "isoformat"):
            data[field_name] = value.isoformat() if value else None
        elif isinstance(value, Decimal):
            data[field_name] = str(value)
        else:
            try:
                json.dumps(value)
                data[field_name] = value
            except (TypeError, ValueError):
                data[field_name] = str(value)

    return data