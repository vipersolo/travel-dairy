from django.contrib import admin
from .models import Destination, Accommodation, TourPackage, Booking, Review

admin.site.register(Destination)
admin.site.register(Accommodation)
admin.site.register(TourPackage)
admin.site.register(Booking)
admin.site.register(Review)