from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.middleware.csrf import get_token

@api_view(['GET'])
def get_csrf_token(request):
    return Response({'csrfToken': get_token(request)})