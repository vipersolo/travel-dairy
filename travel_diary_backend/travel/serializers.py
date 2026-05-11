from rest_framework import serializers
from .models import Destination, Accommodation, TourPackage, Booking, Review

class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'

class AccommodationSerializer(serializers.ModelSerializer):
    # These read-only fields pull data from related tables so React doesn't 
    # just get an ID (e.g., manager: 1), but the actual name for the UI.
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    manager_company = serializers.CharField(source='manager.company_name', read_only=True)

    class Meta:
        model = Accommodation
        fields = '__all__'

class TourPackageSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    
    class Meta:
        model = TourPackage
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        # Protect internal fields from being overwritten by external requests
        read_only_fields = ('status', 'total_amount')

    def validate(self, data):
        """
        Custom object-level validation to ensure strict business rules.
        """
        has_accommodation = data.get('accommodation') is not None
        has_tour_package = data.get('tour_package') is not None

        if has_accommodation and has_tour_package:
            raise serializers.ValidationError("A booking cannot be for both an accommodation and a tour package.")
        if not has_accommodation and not has_tour_package:
            raise serializers.ValidationError("A booking must include either an accommodation or a tour package.")
        
        # Ensure Check-out is after Check-in
        if data.get('check_in_date') and data.get('check_out_date'):
            if data['check_in_date'] >= data['check_out_date']:
                raise serializers.ValidationError("Check-out date must be after check-in date.")
                
        return data

class ReviewSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.first_name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'