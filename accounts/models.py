from django.db import models
from django.utils import timezone
import random, string
from django.contrib.auth.models import User
# Create your models here.


class hub_acc(models.Model):
    acc_TYPES = (
        (1,'admin'),
        (2,'normal_user'),
        (3,'guest'),
    )
    acc_type = models.PositiveSmallIntegerField(
        choices=acc_TYPES,
        default=2,
    )
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    telephone = models.CharField(max_length=100,null=True)
    hub_name = models.CharField(max_length=228)
    address_line1 = models.CharField(max_length=100, null=True, blank=True)
    address_line2 = models.CharField(max_length=100, null=True, blank=True)
    registration_date = models.DateTimeField(null=True,editable=False)
    api_key = models.CharField(max_length=128,editable=False, unique=True)

    def __str__(self):
        return self.user.username +": "+ self.api_key

    def save(self, *args, **kwargs):
        if not self.api_key:
            self.registration_date = timezone.now()
            try:
                self.api_key = ''.join(random.choices(string.ascii_letters + string.digits , k=128))
                super(hub_acc, self).save(*args,**kwargs)
            except IntegrityError:
                self.save(*args,**kwargs)

        

class login_history(models.Model):
    account = models.ForeignKey(hub_acc, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    login_time = models.DateTimeField(blank=True)

    def __str__(self):
        return self.ip_address

    def save(self,*args,**kwargs):
        self.login_time = timezone.now()
        super(login_history,self).save(*args,**kwargs)

