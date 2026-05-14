import requests
import logging
from decimal import Decimal
from datetime import date

# Set up standard logging
logger = logging.getLogger(__name__)

class LocationService:
    """
    Handles all external calls to OpenStreetMap services.
    Completely free, no API keys required.
    """
    NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search"
    OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/driving"

    @staticmethod
    def get_coordinates(address_or_city):
        """
        Converts a text address/city into Latitude & Longitude using Nominatim.
        """
        headers = {
            # Nominatim requires a User-Agent header to prevent abuse
            'User-Agent': 'TravelDiaryApp/1.0 (your_email@example.com)'
        }
        params = {
            'q': address_or_city,
            'format': 'json',
            'limit': 1
        }
        
        try:
            response = requests.get(LocationService.NOMINATIM_BASE_URL, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            if data:
                return {
                    'latitude': Decimal(data[0]['lat']),
                    'longitude': Decimal(data[0]['lon'])
                }
            return None
        except requests.RequestException as e:
            logger.error(f"Geocoding failed for {address_or_city}: {e}")
            return None

    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        """
        Calculates driving distance (in kilometers) between two coordinates using OSRM.
        """
        coords = f"{lon1},{lat1};{lon2},{lat2}"
        url = f"{LocationService.OSRM_BASE_URL}/{coords}?overview=false"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data['code'] == 'Ok':
                distance_meters = data['routes'][0]['distance']
                return round(distance_meters / 1000, 2) # Convert to KM
            return None
        except requests.RequestException as e:
            logger.error(f"Routing failed: {e}")
            return None


class BudgetService:
    """
    Handles internal business logic for estimating trip costs.
    """
    @staticmethod
    def estimate_trip_cost(accommodation, tour_package, check_in: date, check_out: date):
        """
        Calculates the total budget based on nights stayed and package costs.
        """
        total_cost = Decimal('0.00')
        
        if not check_in or not check_out or check_in >= check_out:
            raise ValueError("Invalid check-in/check-out dates.")
            
        nights = (check_out - check_in).days
        
        if accommodation:
            total_cost += accommodation.price_per_night * Decimal(nights)
            
        if tour_package:
            # Assuming tour package is a one-time flat fee added to the trip
            total_cost += tour_package.total_price
            
        return total_cost