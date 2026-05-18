from django.core.cache import cache
from rest_framework.decorators import action
from rest_framework.response import Response
from .ml_services import RecommendationService
from rest_framework import viewsets, permissions, serializers
from .serializers import BudgetEstimateSerializer
from .models import Destination, Accommodation, TourPackage, Booking, Review
from .serializers import (
    DestinationSerializer, AccommodationSerializer,
    TourPackageSerializer, BookingSerializer, ReviewSerializer
)
from .permissions import IsManagerOrReadOnly, IsCitizen
from .services import BudgetService
from django.db.models import Case, When
from rest_framework import status



class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    # Admins should manage destinations, but for now, let anyone view them
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """
        Endpoint: GET /api/v1/travel/destinations/{id}/recommendations/
        Returns a list of similar destinations based on NLP machine learning.
        """
        # Industry Standard: Cache the heavy ML computation.
        # We create a unique cache key for each destination.
        cache_key = f'destination_recs_{pk}'
        
        # Check if we already calculated this recently
        recommended_ids = cache.get(cache_key)

        if recommended_ids is None:
            # Cache miss: Run the Machine Learning model
            try:
                target_id = int(pk)
            except ValueError:
                return Response({"error": "Invalid ID format."}, status=400)
                
            recommended_ids = RecommendationService.get_similar_destinations(target_id)
            
            # Store the result in memory for 24 hours (86400 seconds)
            # This means the ML math only runs once per day per destination
            cache.set(cache_key, recommended_ids, timeout=86400)

        # Fetch the actual Django model instances using the recommended IDs
        # We use __in to fetch them all in one single, optimized database query
        print(recommended_ids)
        preserved_order = Case(
            *[When(pk=pk, then=pos) for pos, pk in enumerate(recommended_ids)]
        )
        similar_destinations = Destination.objects.filter(
            id__in=recommended_ids
        ).order_by(preserved_order)

        # Serialize and return the data
        serializer = self.get_serializer(similar_destinations, many=True)
        return Response(serializer.data)

class AccommodationViewSet(viewsets.ModelViewSet):
    # Industry Standard: select_related prevents the N+1 query problem
    queryset = Accommodation.objects.select_related('destination', 'manager').all()
    serializer_class = AccommodationSerializer
    # Locked down: Only Managers can add hotels.
    permission_classes = [IsManagerOrReadOnly]

    




class TourPackageViewSet(viewsets.ModelViewSet):
    queryset = TourPackage.objects.select_related('destination', 'manager').all()
    serializer_class = TourPackageSerializer
    permission_classes = [IsManagerOrReadOnly]



class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('citizen', 'accommodation', 'tour_package').all()
    serializer_class = BookingSerializer
    # Locked down: Only Citizens can book.
    permission_classes = [IsCitizen]

    def get_queryset(self):
        """
        Security feature: A citizen should only see THEIR OWN bookings, 
        not the entire database of bookings.
        """
        user = self.request.user
        if user.role == 'CITIZEN':
            return self.queryset.filter(citizen__user=user)
        return self.queryset.none()
    
    def perform_create(self, serializer):
        """
        Industry Standard: Overriding perform_create to inject business logic.
        We calculate the budget dynamically before saving.
        """
        validated_data = serializer.validated_data
        
        try:
            # Calculate the cost using our Service Layer
            total_amount = BudgetService.estimate_trip_cost(
                accommodation=validated_data.get('accommodation'),
                tour_package=validated_data.get('tour_package'),
                check_in=validated_data.get('check_in_date'),
                check_out=validated_data.get('check_out_date')
            )
            
            # Automatically assign the logged-in citizen and the calculated amount
            serializer.save(
                citizen=self.request.user.citizen_profile,
                total_amount=total_amount
            )
        except ValueError as e:
            raise serializers.ValidationError({"date_error": str(e)})
        
    
    @action(detail=False, methods=['post'])
    def estimate_budget(self, request):
        """
        Endpoint: POST /api/v1/travel/bookings/estimate_budget/
        Allows frontend to show live price updates before the user hits "Book".
        """
        # 1. Pass the raw request data to our new custom serializer
        serializer = BudgetEstimateSerializer(data=request.data)
        
        # 2. This single line handles ALL error checking. 
        # If the data is bad, it safely aborts and returns a clean 400 Bad Request JSON to React.
        serializer.is_valid(raise_exception=True) 

        # 3. If we get here, the data is 100% clean, safe, and formatted correctly
        clean_data = serializer.validated_data
        
        acc_id = clean_data.get('accommodation_id')
        tp_id = clean_data.get('tour_package_id')
        
        acc = Accommodation.objects.filter(id=acc_id).first() if acc_id else None
        tp = TourPackage.objects.filter(id=tp_id).first() if tp_id else None
        
        try:
            # Pass the safely extracted Python Date objects to the service
            cost = BudgetService.estimate_trip_cost(
                accommodation=acc, 
                tour_package=tp, 
                check_in=clean_data['check_in_date'], 
                check_out=clean_data['check_out_date']
            )
            return Response({"estimated_total": cost})
        except ValueError as e:
            # Catching any edge-case math errors from the Service layer
            return Response({"error": str(e)}, status=400)
        

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Endpoint: POST /api/v1/travel/bookings/{id}/cancel/
        Safely cancels a booking if it is in a valid state.
        """
        # 1. Fetch the specific booking (get_object ensures it belongs to the logged-in user)
        booking = self.get_object()

        # 2. State Machine Gatekeeping
        if booking.status == Booking.BookingStatus.CANCELLED:
            return Response(
                {"error": "This booking is already cancelled."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if booking.status == Booking.BookingStatus.COMPLETED:
            return Response(
                {"error": "Cannot cancel a trip that has already been completed."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Perform the State Change
        booking.status = Booking.BookingStatus.CANCELLED
        booking.save()

        # 4. Return the updated data to the frontend
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('citizen', 'destination', 'accommodation').all()
    serializer_class = ReviewSerializer
    permission_classes = [IsCitizen]