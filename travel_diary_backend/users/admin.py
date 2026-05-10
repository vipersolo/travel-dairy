from django.contrib import admin
from .models import BaseUser, Citizen, Admin, Manager

admin.site.register(BaseUser)
admin.site.register(Citizen)
admin.site.register(Admin)
admin.site.register(Manager)