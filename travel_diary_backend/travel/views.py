from rest_framework import viewsets
from .models import Destination, Accommodation, TourPackage, Booking, Review
from .serializers import (
    DestinationSerializer, AccommodationSerializer,
    TourPackageSerializer, BookingSerializer, ReviewSerializer
)

class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer

class AccommodationViewSet(viewsets.ModelViewSet):
    # Industry Standard: select_related prevents the N+1 query problem
    queryset = Accommodation.objects.select_related('destination', 'manager').all()
    serializer_class = AccommodationSerializer

class TourPackageViewSet(viewsets.ModelViewSet):
    queryset = TourPackage.objects.select_related('destination', 'manager').all()
    serializer_class = TourPackageSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('citizen', 'accommodation', 'tour_package').all()
    serializer_class = BookingSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('citizen', 'destination', 'accommodation').all()
    serializer_class = ReviewSerializer