import requests
from django.conf import settings

def verify_recaptcha(token):
    secret_key = settings.RECAPTCHA_SECRET_KEY
    response = requests.post(
        'https://www.google.com/recaptcha/api/siteverify',
        data={
            'secret': secret_key,
            'response': token,
        }
    )
    result = response.json()
    return result.get("success", False) and result.get("score", 0) > 0.5