from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None and response.status_code == 401:
        response.data = {
            'detail': 'Authentication credentials were not provided or expired.',
            'code': 'token_not_valid'
        }

    return response