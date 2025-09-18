from .utils import set_current_request, clear_current_request

class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        set_current_request(request)
        response = self.get_response(request)
        clear_current_request()
        return response