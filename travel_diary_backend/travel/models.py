from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from users.models import Citizen

# ==========================================
# Abstract Base Model
# ==========================================

class TimeStampedModel(models.Model):
    """
    An abstract base class that provides self-updating
    'created_at' and 'updated_at' fields for auditing.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

# ==========================================
# Travel Entities
# ==========================================

class Destination(TimeStampedModel):
    name = models.CharField(max_length=255, db_index=True)
    country = models.CharField(max_length=100)
    description = models.TextField()
    best_time_to_visit = models.CharField(max_length=100, blank=True, null=True)
    
    # Storing coordinates for Google Maps API integration later
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def __str__(self):
        return f"{self.name}, {self.country}"

class Accommodation(TimeStampedModel):
    manager = models.ForeignKey('users.Manager', on_delete=models.CASCADE, related_name='accommodations')
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='accommodations')
    name = models.CharField(max_length=255)
    address = models.TextField()
    
    # Financials must ALWAYS use DecimalField
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Rating validation (1 to 5 stars)
    star_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=3
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.destination.name}"

class TourPackage(TimeStampedModel):
    manager = models.ForeignKey('users.Manager', on_delete=models.CASCADE, related_name='tour_packages')
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='tour_packages')
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration_days = models.IntegerField(default=7, help_text="Strict duration of the tour in days") 
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.duration_days} Days)"

# ==========================================
# Transactional & User-Generated Data
# ==========================================

class Booking(TimeStampedModel):
    class BookingStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        CANCELLED = 'CANCELLED', _('Cancelled')
        COMPLETED = 'COMPLETED', _('Completed')

    citizen = models.ForeignKey('users.Citizen', on_delete=models.CASCADE, related_name='bookings')
    
    # A booking can be for an accommodation OR a tour package. 
    # We allow both to be nullable, but we will enforce logic in the serializers later.
    accommodation = models.ForeignKey(Accommodation, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    tour_package = models.ForeignKey(TourPackage, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING,
        db_index=True  # Indexed because we will frequently filter "Active" or "Past" bookings
    )

    def __str__(self):
        return f"Booking {self.id} by {self.citizen.first_name} - {self.status}"


class Review(models.Model):
    citizen = models.ForeignKey(Citizen, on_delete=models.CASCADE, related_name='reviews')
    # It links to Destination, so we use 'destination' in our Meta class below
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # FIXED: Changed 'accommodation' to 'destination' to match the field above
        unique_together = ['citizen', 'destination']

    def __str__(self):
        # Using citizen.user.email is generally safer here depending on how your BaseUser is set up
        return f"Review by Citizen #{self.citizen.id} - {self.rating} Stars"