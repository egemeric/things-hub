from sensors.models import hub_sensors, sensor_data_history
from accounts.models import hub_acc
class db_operations(hub_sensors,hub_acc,sensor_data_history):
    def __init__(self,request):
        self.request = request
        self.user_apis = hub_acc.objects.filter(user=self.request.user)
        self.get_sensor_api_by_api()
            
    def get_sensor_api_by_api(self):
        api_sensors_list = []
        for api in self.user_apis:
            api_sensors_list.append(hub_sensors.objects.filter(owner_hub=api))
        self.api_sensors = api_sensors_list
        # Get all sensors which are related with user's api keys
    def get_sensor_data(self,sensor_obj):
        return sensor_data_history.objects.filter(sensor=sensor_obj)