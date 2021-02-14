from django.shortcuts import render
from django.views import View
from dboperations.operations import db_operations
# Create your views here.
class get_user_apis(View):
    template_name = 'get_user_apis.html'

    def get(self, request, *args, **kwargs):
        db_object = db_operations(self.request)
        user_apis = db_object.user_apis
        content={"apis":user_apis}
        return render(request,self.template_name,content)