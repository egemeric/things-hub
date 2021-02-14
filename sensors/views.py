from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.views import View
from sensors.models import hub_sensors, sensor_data_history
from accounts.models import hub_acc

# Create your views here.
class db_operations(hub_sensors,hub_acc,sensor_data_history):
    def __init__(self,request):
        self.request=request
        self.user_apis=hub_acc.objects.filter(user=self.request.user)
        self.get_sensor_api_by_api()
            
    def get_sensor_api_by_api(self):
        api_sensors_list=[]
        for api in self.user_apis:
            api_sensors_list.append(hub_sensors.objects.filter(owner_hub=api))
        self.api_sensors=api_sensors_list
        # Get all sensors which are related with user's api keys
    

class get_sensor_data(View):
    template_name = 'get_sensor_data.html'
    def __init__(self):
        pass
    def get(self,request,*args,**kwargs):
        db_object=db_operations(self.request)
        
        print(db_object.api_sensors)
        return render(request, self.template_name)

