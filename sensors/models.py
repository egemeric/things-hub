from django.db import models
from accounts.models import hub_acc
# Create your models here.


class hub_sensors(models.Model):
    sensor_types = (
        (1,'gps-tracker'),
        (2,'2d-way-sensor'),
        (3,'DHT22'),
        (4,'BMP-Barometer'),
        (5,'Ambient-light'),
        (6,'Camera'),
    )
    id = models.AutoField(primary_key=True)
    owner_hub = models.ManyToManyField(hub_acc)
    sensor_name = models.CharField(max_length=128, null=True,blank=True)
    sensor_type = models.PositiveIntegerField(
        null = True,
        blank=True,
        choices = sensor_types,
    )
    latest_data = models.JSONField(null=True, blank=True)
    latest_heartbeat = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sensor_name
        
    def save(self, *args, **kwargs):
        if self.latest_data:
            hist=sensor_data_history(sensor=self,data=self.latest_data,time=self.latest_heartbeat)
            hist.save()
        super(hub_sensors, self).save(*args, **kwargs)
        

class sensor_data_history(models.Model):
    sensor = models.ForeignKey(hub_sensors,on_delete=models.CASCADE)
    data = models.JSONField()
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.sensor.sensor_name) + ":" + str(self.sensor.owner_hub.all()) + ":" + str(self.time)
