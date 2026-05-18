from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DestinationViewSet, AccommodationViewSet,
    TourPackageViewSet, BookingViewSet, ReviewViewSet, ModeratorReviewViewSet, ModeratorAnalyticsView
)



# The DefaultRouter automatically creates the standard REST URLs
router = DefaultRouter()
router.register(r'destinations', DestinationViewSet)
router.register(r'accommodations', AccommodationViewSet)
router.register(r'tour-packages', TourPackageViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'reviews', ReviewViewSet)
# Add this to your travel/urls.py router registrations
router.register(r'moderator/reviews', ModeratorReviewViewSet, basename='moderator-reviews')

urlpatterns = [
    path('moderator/analytics/', ModeratorAnalyticsView.as_view(), name='moderator-analytics'),
    path('', include(router.urls)),
]