from django.contrib import admin
from .models import sensor_data_history, hub_sensors
# Register your models here.
admin.site.register(hub_sensors)
admin.site.register(sensor_data_history)