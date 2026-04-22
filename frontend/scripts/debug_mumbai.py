import json
import os
import subprocess
import re
import time

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9 ]', '', text)
    return text.replace(' ', '-')

json_path = r'c:\TripEase\frontend\src\data\itineraryData.json'
public_images_base = r'c:\TripEase\frontend\public\images'

def download_image(url, target_path):
    print(f"  Attempting download from: {url}")
    try:
        temp_path = target_path + ".tmp"
        res = subprocess.run(['curl', '-L', '-m', '20', '-A', 'Mozilla/5.0', '-o', temp_path, url], 
                           capture_output=True, check=True)
        
        if os.path.exists(temp_path) and os.path.getsize(temp_path) > 1000:
            print(f"  SUCCESS: {os.path.getsize(temp_path)} bytes")
            os.replace(temp_path, target_path)
            return True
        else:
            size = os.path.getsize(temp_path) if os.path.exists(temp_path) else "MISSING"
            print(f"  FAILURE: Size is {size} bytes")
            if os.path.exists(temp_path): os.remove(temp_path)
            return False
    except Exception as e:
        print(f"  ERROR: {e}")
        return False

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

city = "Mumbai"
city_data = data['destinations'][city]
city_slug = "mumbai"
city_dir = os.path.join(public_images_base, city_slug)

for cat in ['places', 'food', 'markets']:
    if cat in city_data:
        for item in city_data[cat]:
            url = item.get('image', '')
            name_slug = slugify(item['name'])
            filename = f"{name_slug}.jpg"
            local_filepath = os.path.join(city_dir, filename)
            
            print(f"Processing {item['name']}...")
            if url.startswith('http'):
                download_image(url, local_filepath)
            else:
                print(f"  Skipping: Already local path {url}")
