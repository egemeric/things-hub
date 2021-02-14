from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.views import View
from dboperations.operations import db_operations


class get_sensor_data(View):
    template_name = 'get_sensor_data.html'
    
    def __init__(self):
        pass

    def get(self,request,*args,**kwargs):
        db_object=db_operations(self.request)
        dt=db_object.get_sensor_data(db_object.api_sensors[0][0])
        return render(request, self.template_name)

class get_user_apis(View):
    template_name = 'get_user_apis.html'

    def get(self, request, *args, **kwargs):
        db_object = db_operations(self.request)
        user_apis = db_object.user_apis
        

