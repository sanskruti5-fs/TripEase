import json
import os

json_path = r'c:\TripEase\frontend\src\data\itineraryData.json'

# Final high-quality URL mapping for all 19 cities
city_image_map = {
    "Manali": "6y9j-i2w-2c",
    "Goa": "photo-1512343879784-a960bf40e7f2",
    "Mumbai": "photo-1570160898852-005080097721",
    "Delhi": "photo-1587474260584-136574528ed5",
    "Jaipur": "photo-1599661046289-e31897846e41",
    "Udaipur": "photo-1591147139235-96129802fdcc",
    "Kochi": "photo-1590050752117-23a9d7fc21c3",
    "Kolkata": "photo-1558431382-7484643b0185",
    "Bengaluru": "photo-1596422846543-b5f6488aef6a",
    "Hyderabad": "photo-1621252179027-94459d278660",
    "Rishikesh": "photo-1593181629936-11c609b8db9b",
    "Leh-Ladakh": "photo-1514082242765-7c98ca0f3df3",
    "Bali": "photo-1537996194471-e657df975ab4",
    "Bangkok": "photo-1512453979798-5ea266f8880c",
    "Dubai": "photo-1512453979798-5ea266f8880c",
    "Varanasi": "photo-1561359313-0639aad49ca6",
    "Agra": "photo-1564507592333-c60657eea21d",
    "Amsterdam": "photo-1512470876302-972fad2aa9dd",
    "London": "photo-1513635269975-59663e0ac1ad",
    "New York": "photo-1496442226666-8d4d0e62e6e9",
    "Tokyo": "photo-1540959733332-e94e270b4052",
    "Singapore": "photo-1525596662741-e94ff993634c",
    "Istanbul": "photo-1524231757912-21f4fe3a7200",
    "Paris": "photo-1502602898657-3e91760cbb34"
}

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# List of priority cities that we want to FORCE reset (in case local paths are broken)
priority_cities = ["Mumbai", "Varanasi", "Udaipur", "Agra", "Leh-Ladakh", "Amsterdam", "London", "Singapore", "New York"]

for city_name, city_data in data['destinations'].items():
    city_id = city_image_map.get(city_name)
    
    for cat in ['places', 'food', 'markets']:
        if cat in city_data:
            for item in city_data[cat]:
                # If it's a priority city, we FORCE reset to http to ensure fresh migration
                # Otherwise, we leave existing local paths alone
                if city_name not in priority_cities and not item.get('image', '').startswith('http'):
                    continue
                
                if city_id:
                    item['image'] = f"https://images.unsplash.com/{city_id}?auto=format&fit=crop&w=800&q=80"
                else:
                    # Only fallback if we haven't already got a path
                    if item.get('image', '').startswith('http') or not item.get('image'):
                        item['image'] = "https://images.unsplash.com/photo-1548325852-870d0d82944b?auto=format&fit=crop&w=800&q=80"

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)

print("itineraryData.json has been aggressively reset for priority cities.")
