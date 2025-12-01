from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

class CookieOrHeaderJWTAuthentication(JWTAuthentication):
    """
    Authenticate from HttpOnly cookie first (for web),
    fallback to Authorization header (for mobile app).
    Also checks token invalidation after logout.
    """
    def authenticate(self, request):
        # 1. Try cookie first
        raw_token = request.COOKIES.get("access_token")

        # 2. If no cookie, fallback to Authorization header
        if raw_token is None:
            header = self.get_header(request)
            raw_token = self.get_raw_token(header)

        # 3. No token found
        if raw_token is None:
            return None

        # 4. Validate token
        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception:
            return None  # Invalid token

        # 5. Get user
        user = self.get_user(validated_token)

        # 6. Check if token issued before last logout
        token_iat = validated_token.get("iat")
        if user.last_logout_at and token_iat < int(user.last_logout_at.timestamp()):
            raise AuthenticationFailed("Token expired due to logout from another device.")

        return (user, validated_token)
