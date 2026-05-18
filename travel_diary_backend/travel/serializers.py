from rest_framework import serializers
from datetime import timedelta

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
        check_in = data.get('check_in_date')
        check_out = data.get('check_out_date')
        accommodation = data.get('accommodation')
        tour_package = data.get('tour_package')

        # 1. Ensure dates make chronological sense
        if check_in and check_out and check_in >= check_out:
            raise serializers.ValidationError("Check-out date must be after check-in date.")

        # 2. Must select exactly one inventory type
        if accommodation and tour_package:
            raise serializers.ValidationError("Cannot book both an accommodation and a tour package in the same booking.")
        if not accommodation and not tour_package:
            raise serializers.ValidationError("Must select either an accommodation or a tour package.")

        # 3. NEW: Strict Date Validation for Tour Packages
        if tour_package and check_in and check_out:
            # Calculate what the check-out date SHOULD be
            expected_check_out = check_in + timedelta(days=tour_package.duration_days)
            
            if check_out != expected_check_out:
                raise serializers.ValidationError(
                    f"Invalid dates. '{tour_package.name}' is strictly a {tour_package.duration_days}-day package. "
                    f"If you start on {check_in}, your check-out date must be {expected_check_out}."
                )

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
    
class ModeratorReviewSerializer(serializers.ModelSerializer):
    author_email = serializers.CharField(source='citizen.user.email', read_only=True)
    target_name = serializers.CharField(source='destination.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'author_email', 'target_name', 'rating', 'comment', 'is_visible', 'created_at']

class PublicReviewSerializer(serializers.ModelSerializer):
    # Safely expose the user's email or name without exposing their whole account
    author_email = serializers.CharField(source='citizen.user.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'author_email', 'rating', 'comment', 'created_at']
        # The frontend doesn't need to send the citizen or destination IDs; 
        # the backend will determine them automatically.