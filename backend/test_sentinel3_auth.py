#!/usr/bin/env python3
import os
import eumdac
from datetime import datetime, timedelta

consumer_key = os.getenv("EUMETSAT_CONSUMER_KEY", "721ff7HpXF8lUWBmiupzPAs5tQoa")
consumer_secret = os.getenv("EUMETSAT_CONSUMER_SECRET", "vlX2uIc6tkn3dvjpY1i6e3bE1q0a")

print(f"Connecting to EUMETSAT Data Store with key: {consumer_key[:6]}...")
token = eumdac.AccessToken(credentials=(consumer_key, consumer_secret))
datastore = eumdac.DataStore(token)

# Collection for Sentinel-3 SLSTR Level 2 Fire Radiative Power (FRP)
# EO:EUM:DAT:0417 is SLSTR Level 2 Fire Radiative Power (NRT)
collection_id = "EO:EUM:DAT:0417"
try:
    selected_collection = datastore.get_collection(collection_id)
    print(f"Collection Found: {selected_collection.title}")
    
    # Search over India bounding polygon
    # Bounding box India: lon 68.0 to 97.5, lat 6.5 to 37.0
    india_wkt = "POLYGON((68.0 6.5, 97.5 6.5, 97.5 37.0, 68.0 37.0, 68.0 6.5))"
    start_time = datetime.utcnow() - timedelta(days=2)
    
    products = selected_collection.search(geo=india_wkt, dtstart=start_time)
    print(f"Searching for products over India since {start_time.strftime('%Y-%m-%d %H:%M:%S')} UTC...")
    
    count = 0
    for product in products:
        count += 1
        print(f"\nProduct #{count}: {product} (sensing: {product.sensing_start})")
        print(f"Entries: {product.entries}")
        
        # Test opening / reading an entry now that license is active
        for entry in product.entries:
            if "FRP" in entry or "csv" in entry or "standard" in entry or "FRP_MWIR" in entry:
                print(f"Attempting to download/open entry: {entry}")
                try:
                    with product.open(entry) as f:
                        header = f.readline()
                        print(f"SUCCESS! First line of {entry}: {header.decode('utf-8', errors='ignore')[:150]}")
                        line2 = f.readline()
                        print(f"Second line: {line2.decode('utf-8', errors='ignore')[:150]}")
                except Exception as ex:
                    print(f"Download/Open error on {entry}: {ex}")
        if count >= 3:
            break
            
    print(f"\nTotal Sentinel-3 products checked: {count}")

except Exception as e:
    print(f"Error querying collection {collection_id}: {e}")
