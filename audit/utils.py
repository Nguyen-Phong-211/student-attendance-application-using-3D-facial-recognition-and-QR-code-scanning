import threading

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