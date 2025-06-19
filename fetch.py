import requests, json

stops = {
    "place-davis": "Red Line – Davis",
    "place-dwnxg": "Red Line – Downtown Crossing",
    "place-north": "Orange Line – North Station",
    "place-hymnl": "Green Line – Hynes Convention"
}

all_predictions = {}

for stop_id, label in stops.items():
    url = f"https://api-v3.mbta.com/predictions?filter[stop]={stop_id}&sort=departure_time"
    resp = requests.get(url)
    data = resp.json()
    all_predictions[stop_id] = {
        "label": label,
        "predictions": data.get("data", [])
    }

with open("data/predictions.json", "w") as f:
    json.dump(all_predictions, f, indent=2)
