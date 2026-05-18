from travel.models import Destination

destinations = [
    {
        "name": "Paris",
        "country": "France",
        "description": "Famous for the Eiffel Tower, art museums, romantic atmosphere, cafes, and historic architecture.",
        "best_time_to_visit": "April to June",
        "latitude": 48.8566,
        "longitude": 2.3522
    },
    {
        "name": "Tokyo",
        "country": "Japan",
        "description": "Modern city with anime culture, advanced technology, temples, cherry blossoms, and delicious sushi.",
        "best_time_to_visit": "March to May",
        "latitude": 35.6762,
        "longitude": 139.6503
    },
    {
        "name": "Maldives",
        "country": "Maldives",
        "description": "Luxury beach destination with crystal clear water, water villas, scuba diving, and tropical islands.",
        "best_time_to_visit": "November to April",
        "latitude": 3.2028,
        "longitude": 73.2207
    },
    {
        "name": "Dubai",
        "country": "UAE",
        "description": "Luxury shopping, skyscrapers, desert safari, modern architecture, and nightlife attractions.",
        "best_time_to_visit": "November to March",
        "latitude": 25.2048,
        "longitude": 55.2708
    },
    {
        "name": "Munnar",
        "country": "India",
        "description": "Hill station in Kerala known for tea plantations, cool climate, waterfalls, and scenic mountain views.",
        "best_time_to_visit": "September to March",
        "latitude": 10.0889,
        "longitude": 77.0595
    },
    {
        "name": "Bali",
        "country": "Indonesia",
        "description": "Popular island destination with beaches, temples, waterfalls, surfing, yoga retreats, and nightlife.",
        "best_time_to_visit": "April to October",
        "latitude": -8.3405,
        "longitude": 115.0920
    },
    {
        "name": "New York",
        "country": "USA",
        "description": "Busy metropolitan city with skyscrapers, Times Square, Central Park, Broadway, and shopping.",
        "best_time_to_visit": "April to June",
        "latitude": 40.7128,
        "longitude": -74.0060
    },
    {
        "name": "Santorini",
        "country": "Greece",
        "description": "Beautiful island with white buildings, blue domes, sunsets, beaches, and romantic resorts.",
        "best_time_to_visit": "May to September",
        "latitude": 36.3932,
        "longitude": 25.4615
    },
    {
        "name": "Swiss Alps",
        "country": "Switzerland",
        "description": "Snowy mountains ideal for skiing, hiking, scenic train rides, and adventure tourism.",
        "best_time_to_visit": "December to February",
        "latitude": 46.8876,
        "longitude": 9.6570
    },
    {
        "name": "Goa",
        "country": "India",
        "description": "Beach destination famous for nightlife, seafood, Portuguese heritage, resorts, and water sports.",
        "best_time_to_visit": "November to February",
        "latitude": 15.2993,
        "longitude": 74.1240
    },
]

for data in destinations:
    Destination.objects.get_or_create(
        name=data["name"],
        defaults=data
    )

print("Destinations populated successfully!")