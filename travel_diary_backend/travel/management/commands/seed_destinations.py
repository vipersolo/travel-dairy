from django.core.management.base import BaseCommand
from travel.models import Destination


class Command(BaseCommand):
    help = "Populate destination data"

    def handle(self, *args, **kwargs):

        destinations = [
            {
    "name": "Ooty",
    "country": "India",
    "description": "Hill station in Tamil Nadu famous for tea gardens, botanical gardens, toy train, lakes, cool climate, trekking, and mountain scenery.",
    "best_time_to_visit": "October to June",
    "latitude": 11.4064,
    "longitude": 76.6932
},
{
    "name": "Wayanad",
    "country": "India",
    "description": "Nature destination in Kerala known for waterfalls, wildlife sanctuary, caves, trekking, forests, camping, and scenic viewpoints.",
    "best_time_to_visit": "October to May",
    "latitude": 11.6854,
    "longitude": 76.1320
},
{
    "name": "Manali",
    "country": "India",
    "description": "Mountain destination in Himachal Pradesh offering snow activities, skiing, paragliding, trekking, rivers, valleys, and adventure sports.",
    "best_time_to_visit": "October to February",
    "latitude": 32.2432,
    "longitude": 77.1892
},
{
    "name": "Leh",
    "country": "India",
    "description": "High altitude destination in Ladakh famous for monasteries, mountains, lakes, road trips, biking, camping, and breathtaking landscapes.",
    "best_time_to_visit": "May to September",
    "latitude": 34.1526,
    "longitude": 77.5770
},
{
    "name": "Jaipur",
    "country": "India",
    "description": "Historic city in Rajasthan featuring forts, palaces, museums, royal architecture, shopping, traditional markets, and cultural heritage.",
    "best_time_to_visit": "October to March",
    "latitude": 26.9124,
    "longitude": 75.7873
},
{
    "name": "Udaipur",
    "country": "India",
    "description": "Romantic city known for lakes, palaces, boat rides, heritage hotels, architecture, cultural festivals, and scenic sunsets.",
    "best_time_to_visit": "September to March",
    "latitude": 24.5854,
    "longitude": 73.7125
},
{
    "name": "Varanasi",
    "country": "India",
    "description": "Ancient spiritual city famous for temples, Ganga river, ghats, religious ceremonies, cultural heritage, and historic streets.",
    "best_time_to_visit": "October to March",
    "latitude": 25.3176,
    "longitude": 82.9739
},
{
    "name": "Agra",
    "country": "India",
    "description": "Historic destination home to the Taj Mahal, Mughal architecture, forts, gardens, heritage monuments, and cultural attractions.",
    "best_time_to_visit": "October to March",
    "latitude": 27.1767,
    "longitude": 78.0081
},
{
    "name": "Darjeeling",
    "country": "India",
    "description": "Mountain town known for tea plantations, Himalayan views, toy train, monasteries, trekking, cool weather, and sunrise viewpoints.",
    "best_time_to_visit": "March to June",
    "latitude": 27.0360,
    "longitude": 88.2627
},
{
    "name": "Rishikesh",
    "country": "India",
    "description": "Adventure and spiritual destination offering river rafting, yoga retreats, meditation, camping, trekking, and suspension bridges.",
    "best_time_to_visit": "September to April",
    "latitude": 30.0869,
    "longitude": 78.2676
},
{
    "name": "Dubai",
    "country": "United Arab Emirates",
    "description": "Modern city featuring skyscrapers, luxury shopping, desert safari, beaches, nightlife, theme parks, and world-class entertainment.",
    "best_time_to_visit": "November to March",
    "latitude": 25.2048,
    "longitude": 55.2708
},
{
    "name": "Paris",
    "country": "France",
    "description": "Romantic city famous for museums, art, cafes, historic landmarks, architecture, shopping, river cruises, and fine dining.",
    "best_time_to_visit": "April to June",
    "latitude": 48.8566,
    "longitude": 2.3522
},
{
    "name": "Rome",
    "country": "Italy",
    "description": "Historic destination featuring ancient ruins, churches, museums, Italian cuisine, architecture, fountains, and cultural heritage.",
    "best_time_to_visit": "April to June",
    "latitude": 41.9028,
    "longitude": 12.4964
},
{
    "name": "Santorini",
    "country": "Greece",
    "description": "Island destination known for white buildings, blue domes, beaches, sunsets, luxury resorts, volcanic landscapes, and romantic vacations.",
    "best_time_to_visit": "April to October",
    "latitude": 36.3932,
    "longitude": 25.4615
},
{
    "name": "Phuket",
    "country": "Thailand",
    "description": "Beach destination offering islands, snorkeling, scuba diving, nightlife, seafood, resorts, water sports, and tropical scenery.",
    "best_time_to_visit": "November to April",
    "latitude": 7.8804,
    "longitude": 98.3923
},
{
    "name": "Maldives",
    "country": "Maldives",
    "description": "Luxury island destination famous for overwater villas, crystal clear water, snorkeling, scuba diving, beaches, coral reefs, and honeymoon resorts.",
    "best_time_to_visit": "November to April",
    "latitude": 3.2028,
    "longitude": 73.2207
},
{
    "name": "Kyoto",
    "country": "Japan",
    "description": "Historic Japanese city known for temples, shrines, cherry blossoms, bamboo forests, gardens, traditional culture, and scenic beauty.",
    "best_time_to_visit": "March to May",
    "latitude": 35.0116,
    "longitude": 135.7681
},
{
    "name": "Tokyo",
    "country": "Japan",
    "description": "Modern metropolis offering technology, shopping, anime culture, museums, nightlife, parks, temples, and world-famous cuisine.",
    "best_time_to_visit": "March to May",
    "latitude": 35.6762,
    "longitude": 139.6503
},
{
    "name": "Swiss Alps",
    "country": "Switzerland",
    "description": "Mountain destination famous for skiing, snowboarding, hiking, cable cars, alpine villages, glaciers, and breathtaking mountain scenery.",
    "best_time_to_visit": "December to March",
    "latitude": 46.8182,
    "longitude": 8.2275
},
{
    "name": "New York City",
    "country": "United States",
    "description": "Global city known for skyscrapers, museums, Broadway shows, shopping, parks, nightlife, iconic landmarks, and diverse cuisine.",
    "best_time_to_visit": "April to June",
    "latitude": 40.7128,
    "longitude": -74.0060
},
        ]

        for data in destinations:
            Destination.objects.update_or_create(
                name=data["name"],
                defaults=data
            )

        self.stdout.write(
            self.style.SUCCESS("Destinations populated successfully!")
        )

