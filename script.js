
const stopSelect = document.getElementById("stopSelect");
const refreshBtn = document.getElementById("refreshBtn");
const output = document.getElementById("output");
let currentStop = "";
let refreshIntervalId = null;

// Populate the dropdown with all stops from local predictions.json
fetch("data/predictions.json")
  .then((res) => res.json())
  .then((stopsData) => {
    for (const stopId in stopsData) {
      const option = document.createElement("option");
      option.value = stopId;
      option.textContent = stopsData[stopId].label;
      stopSelect.appendChild(option);
    }
  });

stopSelect.addEventListener("change", () => {
  currentStop = stopSelect.value;
  refreshBtn.disabled = !currentStop;
});

refreshBtn.addEventListener("click", () => {
  if (!currentStop) return;
  renderPredictions();
  fetchVehicles();
  if (window.map && map.setView) {
    map.setView([42.35, -71.06], 13); // Center on Boston
  }
  if (refreshIntervalId) clearInterval(refreshIntervalId);
  refreshIntervalId = setInterval(() => {
    renderPredictions();
    fetchVehicles();
  }, 30000);
});

// Dummy placeholder functions (replace with real implementations)
function renderPredictions() {
  output.textContent = `Fetching predictions for stop: ${currentStop}`;
}

function fetchVehicles() {
  console.log("Fetching vehicles...");
}
