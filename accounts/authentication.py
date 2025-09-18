from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class that ONLY accepts JWT tokens from HttpOnly cookies.
    This prevents bypassing by sending Authorization headers manually.
    """

    def authenticate(self, request):
        # Get token from cookie
        raw_token = request.COOKIES.get("access_token")

        if raw_token is None:
            return None  # No token in cookie - no authentication

        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception:
            return None  # Invalid token - no authentication possible

        return self.get_user(validated_token), validated_token