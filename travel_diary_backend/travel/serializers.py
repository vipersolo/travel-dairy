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
        # NEW: Force the manager field to be read-only so the frontend doesn't need to pass it
        read_only_fields = ('manager',)

class TourPackageSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    manager_company = serializers.CharField(source='manager.company_name', read_only=True)
    
    class Meta:
        model = TourPackage
        fields = '__all__'
        read_only_fields = ('manager',)


class BookingSerializer(serializers.ModelSerializer):
    accommodation_name = serializers.CharField(source='accommodation.name', read_only=True)
    tour_package_name = serializers.CharField(source='tour_package.title', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        # Protect internal fields from being overwritten by external requests
        read_only_fields = ('citizen','status', 'total_amount')

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


class BudgetEstimateSerializer(serializers.Serializer):
    """
    Validates incoming data for the budget estimation endpoint.
    Not tied to a database model.
    """
    accommodation_id = serializers.IntegerField(required=False, allow_null=True)
    tour_package_id = serializers.IntegerField(required=False, allow_null=True)
    check_in_date = serializers.DateField(required=True)
    check_out_date = serializers.DateField(required=True)

    def validate(self, data):
        """
        Cross-field validation to enforce business rules before hitting the Service layer.
        """
        acc_id = data.get('accommodation_id')
        tp_id = data.get('tour_package_id')

        if not acc_id and not tp_id:
            raise serializers.ValidationError("You must provide either an accommodation_id or a tour_package_id.")

        if data['check_in_date'] >= data['check_out_date']:
            raise serializers.ValidationError({"check_out_date": "Check-out date must be strictly after the check-in date."})

        return data