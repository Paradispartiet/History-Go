// =====================================================
// ROUTES.JS – visning av tematiske ruter i History Go
// =====================================================

let ROUTES = [];

async function loadRoutes() {
  try {
    ROUTES = await fetch("routes.json", { cache: "no-store" }).then(r => r.json());
    console.log("Ruter lastet:", ROUTES.length);
  } catch (err) {
    console.warn("Kunne ikke laste ruter", err);
  }
}

async function showRouteOverlay(routeId) {
  if (!ROUTES.length) await loadRoutes();
  const route = ROUTES.find(r => r.id === routeId);
  if (!route) { showToast("Fant ikke ruten."); return; }

  const overlay = document.createElement("div");
  overlay.id = "routeOverlay";
  overlay.className = "place-overlay";

  overlay.innerHTML = `
    <button class="close-overlay" onclick="closeRouteOverlay()">×</button>
    <div class="place-overlay-content">
      <div class="left">
        <h2>${route.name}</h2>
        <p class="muted">${route.category || ""}</p>
        <p>${route.desc || ""}</p>
        <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;">
          <button class="primary" onclick="focusRouteOnMap('${route.id}')">Se på kart</button>
        </div>
      </div>
      <div class="right">
        ${route.stops.map(stop => `
          <div class="card" style="margin-bottom:8px;">
            <strong>${stop.title}</strong><br>
            <p>${stop.info}</p>
            <button class="ghost" onclick="openPlaceById('${stop.placeId}')">Åpne sted</button>
          </div>`).join("")}
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => {
    if (e.target.id === "routeOverlay") closeRouteOverlay();
  });
}

function closeRouteOverlay() {
  const ov = document.getElementById("routeOverlay");
  if (ov) ov.remove();
}

function openPlaceById(id) {
  const p = PLACES.find(x => x.id === id);
  if (p) openPlaceCard(p);
  closeRouteOverlay();
}

function focusRouteOnMap(routeId) {
  const route = ROUTES.find(r => r.id === routeId);
  if (!route || !MAP) return;
  const coords = route.stops
    .map(s => {
      const plc = PLACES.find(p => p.id === s.placeId);
      return plc ? [plc.lat, plc.lon] : null;
    })
    .filter(Boolean);
  if (coords.length) {
    const line = L.polyline(coords, { color: "#9b59b6", weight: 4 }).addTo(MAP);
    MAP.fitBounds(line.getBounds(), { padding: [60, 60] });
    showToast(`Rute: ${route.name}`);
  }
  closeRouteOverlay();
}

// eksporter til global scope for enkel bruk
window.showRouteOverlay = showRouteOverlay;
window.loadRoutes = loadRoutes;
