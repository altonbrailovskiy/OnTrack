import requests, json

# Get all MBTA stops
stops_url = "https://api-v3.mbta.com/stops"
resp = requests.get(stops_url)
stops_data = resp.json()

# Build a dictionary of stop_id → label (e.g., "Red Line – Davis")
stops = {}
for stop in stops_data.get("data", []):
    stop_id = stop["id"]
    name = stop["attributes"]["name"]
    line_names = stop["relationships"].get("route", {}).get("data", [])
    label = name  # Fallback

    # If route info available, try to extract the line name
    if line_names:
        label = f"{line_names[0]['id'].title()} – {name}"  # 'Red' – 'Davis'

    stops[stop_id] = label

# Fetch predictions for each stop
all_predictions = {}
for stop_id, label in stops.items():
    url = f"https://api-v3.mbta.com/predictions?filter[stop]={stop_id}&sort=departure_time"
    try:
        resp = requests.get(url)
        data = resp.json()
        all_predictions[stop_id] = {
            "label": label,
            "predictions": data.get("data", [])
        }
    except Exception as e:
        print(f"Error fetching {stop_id}: {e}")

# Save to file
with open("data/predictions.json", "w") as f:
    json.dump(all_predictions, f, indent=2)
