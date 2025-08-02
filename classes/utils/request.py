def get_client_ip(request):
    """Get real IP from request, preferably via proxy"""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "").strip()


def get_user_agent(request):
    return request.META.get("HTTP_USER_AGENT", "")
