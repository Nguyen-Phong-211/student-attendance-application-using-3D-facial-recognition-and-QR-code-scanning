"""
URL configuration for attend3d project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import ReactAppView
from django.urls import path, re_path, include
from django.conf.urls import include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/admin/', include('admin_panel.urls')),
    path('api/', include('attend3d.api_urls')),  
    path('api/rooms/', include('rooms.urls')),
    path('api/', include('subjects.urls')),
    path('api/', include('notifications.urls')),
    path('api/lecturers/', include('lecturers.urls')),
    path('', include('classes.urls')),
    path('api/', include('students.urls')),
    re_path(r'^(?!api/).*$', ReactAppView.as_view(), name="react_app"),
    
    # 
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
