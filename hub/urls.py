"""hub URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
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
from django.urls import path, include
from sensors.views import get_sensor_data
from accounts.views import get_user_apis

urlpatterns = [
    path('admin/', admin.site.urls),
    path('sensors/get_sensor_data/',get_sensor_data.as_view(), name='get_sensor_data'),
    path('accounts/get_user_apis/',get_user_apis.as_view(), name='get_user_apis'),
    path('accounts/', include('django.contrib.auth.urls')),
]
