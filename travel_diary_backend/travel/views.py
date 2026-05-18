from django.core.cache import cache
from rest_framework.decorators import action
from rest_framework.response import Response
from .ml_services import RecommendationService
from rest_framework import viewsets, permissions, serializers, status
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
from django.db.models import Q
from users.permissions import IsModerator
from .serializers import ModeratorReviewSerializer, PublicReviewSerializer
from users.models import Citizen
from rest_framework.views import APIView
from django.db.models import Sum
from users.models import BaseUser, Manager, Citizen
from rest_framework.exceptions import PermissionDenied


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
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """
        Endpoint: GET /api/v1/travel/destinations/{id}/reviews/
        Fetches all VISIBLE reviews for this destination.
        """
        destination = self.get_object()
        # Only fetch reviews that haven't been soft-deleted by a Moderator
        reviews = Review.objects.filter(destination=destination, is_visible=True)
        serializer = PublicReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        """
        Endpoint: POST /api/v1/travel/destinations/{id}/add_review/
        Allows a logged-in Citizen to leave a review.
        """
        destination = self.get_object()
        user = request.user

        # 1. Gatekeeping: Only Citizens can review
        if not user.is_authenticated or getattr(user, 'role', '') != 'CITIZEN':
            return Response({"error": "Only registered travelers can leave reviews."}, status=status.HTTP_403_FORBIDDEN)

        try:
            citizen_profile = Citizen.objects.get(user=user)
        except Citizen.DoesNotExist:
            return Response({"error": "Traveler profile not found."}, status=status.HTTP_404_NOT_FOUND)

        # 2. Gatekeeping: Prevent duplicate reviews
        if Review.objects.filter(citizen=citizen_profile, destination=destination).exists():
            return Response({"error": "You have already reviewed this destination."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Save the review
        serializer = PublicReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(citizen=citizen_profile, destination=destination)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AccommodationViewSet(viewsets.ModelViewSet):
    # Industry Standard: select_related prevents the N+1 query problem
    queryset = Accommodation.objects.select_related('destination', 'manager').all()
    serializer_class = AccommodationSerializer
    # Locked down: Only Managers can add hotels.
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        # 1. Grab the base queryset (which has the select_related optimization)
        queryset = super().get_queryset()
        
        # 2. Safely extract and parse the query parameter to handle whitespace or uppercase
        my_listings = self.request.query_params.get('my_listings', '').strip().lower() == 'true'
        
        # 3. Check if the user is authenticated, requesting their listings, and is a MANAGER
        if my_listings and self.request.user.is_authenticated and getattr(self.request.user, 'role', '') == 'MANAGER':
            
            # 4. Bulletproof relational filtering: Find accommodations where the 
            # associated manager's base user ID matches the logged-in user's ID.
            return queryset.filter(manager__user=self.request.user)
            
        return queryset

    def perform_create(self, serializer):
        manager_profile = self.request.user.manager_profile
        
        # NEW: The Verification Gatekeeper
        if not manager_profile.is_verified:
            raise PermissionDenied("Your business account must be verified by an Administrator before you can list accommodations.")
            
        serializer.save(manager=manager_profile)
    




class TourPackageViewSet(viewsets.ModelViewSet):
    queryset = TourPackage.objects.select_related('destination', 'manager').all()
    serializer_class = TourPackageSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        # 1. Grab the base optimized queryset
        queryset = super().get_queryset()
        
        # 2. Safely parse the query parameter
        my_listings = self.request.query_params.get('my_listings', '').strip().lower() == 'true'
        
        # 3. Bulletproof relational filtering for Managers
        if my_listings and self.request.user.is_authenticated and getattr(self.request.user, 'role', '') == 'MANAGER':
            return queryset.filter(manager__user=self.request.user)
            
        return queryset

    def perform_create(self, serializer):
        manager_profile = self.request.user.manager_profile
        
        # NEW: The Verification Gatekeeper
        if not manager_profile.is_verified:
            raise PermissionDenied("Your business account must be verified by an Administrator before you can list tour packages.")
            
        serializer.save(manager=manager_profile)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('citizen', 'accommodation', 'tour_package').all()
    serializer_class = BookingSerializer
    # Locked down: Only Citizens can book change to authenticated users.
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Citizens see what they bought
        if user.role == 'CITIZEN':
            return self.queryset.filter(citizen__user=user)
            
        # 2. Managers see what they sold
        if user.role == 'MANAGER':
            return self.queryset.filter(
                Q(accommodation__manager__user=user) | 
                Q(tour_package__manager__user=user)
            )
            
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

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Endpoint: POST /api/v1/travel/bookings/{id}/update_status/
        Allows a Manager to update the status of an incoming reservation.
        """
        user = request.user
        
        # 1. Gatekeeping: Only Managers can use this specific endpoint
        if getattr(user, 'role', '') != 'MANAGER':
            return Response(
                {"error": "Only business managers can update booking statuses."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Fetch the booking safely (get_object relies on our secure get_queryset)
        booking = self.get_object()
        
        # 3. Extract and validate the new status
        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in Booking.BookingStatus.choices]
        
        if new_status not in valid_statuses:
            return Response({"error": "Invalid status provided."}, status=status.HTTP_400_BAD_REQUEST)
            
        # 4. State Machine logic: Prevent reviving a completed or cancelled trip
        if booking.status in [Booking.BookingStatus.COMPLETED, Booking.BookingStatus.CANCELLED]:
            return Response(
                {"error": f"Cannot alter a booking that is already {booking.status}."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. Save the change and return the fresh data
        booking.status = new_status
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)



class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('citizen', 'destination', 'accommodation').all()
    serializer_class = ReviewSerializer
    permission_classes = [IsCitizen]


class ModeratorReviewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint: /api/v1/travel/moderator/reviews/
    Centralized firehose of all platform reviews for moderation.
    """
    queryset = Review.objects.select_related('citizen__user', 'destination').all()
    serializer_class = ModeratorReviewSerializer
    permission_classes = [IsModerator]

    @action(detail=True, methods=['post'])
    def toggle_visibility(self, request, pk=None):
        """
        Soft-deletes (or restores) a review by toggling is_visible.
        """
        review = self.get_object()
        review.is_visible = not review.is_visible
        review.save()
        
        status_text = "restored" if review.is_visible else "removed"
        return Response({
            "message": f"Review {status_text} successfully.",
            "is_visible": review.is_visible
        }, status=status.HTTP_200_OK)
    

class ModeratorAnalyticsView(APIView):
    """
    Endpoint: GET /api/v1/travel/moderator/analytics/
    Aggregates platform-wide statistics using database-level math for high performance.
    """
    permission_classes = [IsModerator]

    def get(self, request):
        # 1. Financial Aggregation (PostgreSQL does the heavy lifting here)
        revenue_agg = Booking.objects.filter(
            status__in=[Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.COMPLETED]
        ).aggregate(total=Sum('total_amount'))
        
        # If there are no bookings yet, Sum returns None, so we default to 0.00
        total_revenue = revenue_agg['total'] or 0.00

        # 2. Booking Volume
        total_bookings = Booking.objects.count()
        pending_bookings = Booking.objects.filter(status=Booking.BookingStatus.PENDING).count()

        # 3. User Demographics
        total_users = BaseUser.objects.count()
        total_managers = Manager.objects.count()
        total_citizens = Citizen.objects.count()

        # 4. Construct the custom JSON payload
        return Response({
            "financials": {
                "total_platform_revenue": total_revenue,
            },
            "bookings": {
                "total_volume": total_bookings,
                "action_required": pending_bookings,
            },
            "users": {
                "total": total_users,
                "businesses": total_managers,
                "travelers": total_citizens
            }
        })