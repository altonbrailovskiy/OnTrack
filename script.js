const stopsByLine = {
  Red: { "place-alewife": "Alewife", "place-davis": "Davis", "place-porter": "Porter", "place-harvard": "Harvard", "place-central": "Central", "place-kendall": "Kendall/MIT", "place-chmnl": "Charles/MGH", "place-park": "Park Street", "place-dwnxg": "Downtown Crossing", "place-sstat": "South Station", "place-jfk": "JFK/UMass", "place-andrw": "Andrew", "place-fldcr": "Fields Corner", "place-shmnl": "Shawmut", "place-asmnl": "Ashmont", "place-brntn": "Braintree", "place-qnctr": "Quincy Center", "place-qamnl": "Quincy Adams", "place-nqncy": "North Quincy", "place-wlsta": "Wollaston" },
  Orange: { "place-fore": "Forest Hills", "place-rugg": "Ruggles", "place-masta": "Mass Ave", "place-backb": "Back Bay", "place-tufts": "Tufts Med", "place-dwnxg": "Downtown Crossing", "place-state": "State", "place-haymr": "Haymarket", "place-north": "North Station", "place-sull": "Sullivan", "place-ccole": "Community College", "place-welln": "Wellington", "place-astao": "Assembly", "place-malf": "Malden Center", "place-ogmnl": "Oak Grove" },
  Green: { "place-lech": "Lechmere", "place-scien": "Science Park", "place-north": "North Station", "place-haymr": "Haymarket", "place-gover": "Government Center", "place-park": "Park Street", "place-boyls": "Boylston", "place-arbor": "Arborway", "place-prmnl": "Prudential", "place-cool": "Coolidge Corner", "place-hymnl": "Hynes Convention", "place-kencl": "Kenmore" }
};

const lineFilter = document.getElementById("lineFilter");
const stationSelect = document.getElementById("stationSelect");
const output = document.getElementById("output");
let currentStop = "";

lineFilter.addEventListener("change", () => {
  const line = lineFilter.value;
  stationSelect.disabled = !line;
  stationSelect.innerHTML = '';
  if (line) {
    Object.entries(stopsByLine[line]).forEach(([id, name]) => {
      const opt = new Option(name, id);
      stationSelect.add(opt);
    });
  }
});

stationSelect.addEventListener("change", () => {
  currentStop = stationSelect.value;
  renderPredictions();
});

function updateTimestamp(containerId = "output") {
  const now = new Date();
  const stamp = document.createElement("div");
  stamp.style.fontSize = "0.85rem";
  stamp.style.marginTop = "1rem";
  stamp.innerText = `Last updated: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  document.getElementById(containerId).appendChild(stamp);
}

async function renderPredictions() {
  if (!currentStop) {
    output.textContent = "Please select a station.";
    return;
  }
  const res = await fetch(`https://api-v3.mbta.com/predictions?filter[stop]=${currentStop}&sort=departure_time`);
  const data = await res.json();
  output.innerHTML = "";
  if (!data.data.length) {
    output.textContent = "No upcoming trains.";
    updateTimestamp();
    return;
  }
  data.data.forEach(pred => {
    const t = pred.attributes.departure_time;
    if (!t) return;
    const time = new Date(t);
    output.innerHTML += `<p><strong>${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></p>`;
  });
  updateTimestamp();
}

const map = L.map('map').setView([42.36, -71.06], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];
async function fetchVehicles() {
  const res = await fetch("https://api-v3.mbta.com/vehicles?filter[route_type]=1");
  const data = await res.json();
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  data.data.forEach(vehicle => {
    const lat = vehicle.attributes.latitude;
    const lon = vehicle.attributes.longitude;
    const label = vehicle.relationships.route.data.id.toUpperCase();
    if (lat && lon) {
      const marker = L.marker([lat, lon], { route: label.toLowerCase() }).addTo(map)
        .bindPopup(`<strong>${label}</strong><br>Status: ${vehicle.attributes.current_status}`);
      markers.push(marker);
    }
  });
}

// Initial load
fetchVehicles();
setInterval(fetchVehicles, 30000);

// Refresh predictions every 30s if a station is selected
setInterval(() => {
  if (currentStop) renderPredictions();
}, 30000);
