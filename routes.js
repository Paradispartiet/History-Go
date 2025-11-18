// =====================================================
// ROUTES.JS – visning av tematiske ruter i History Go
// =====================================================

let ROUTES = [];

// ------------------------------
// Laster rutene fra JSON
// ------------------------------
async function loadRoutes() {
  try {
    ROUTES = await fetch("routes.json", { cache: "no-store" }).then(r => r.json());
    console.log("Ruter lastet:", ROUTES.length);
  } catch (err) {
    console.warn("Kunne ikke laste ruter", err);
  }
}

// ------------------------------
// Viser rutebeskrivelsen som overlay
// ------------------------------
async function showRouteOverlay(routeId) {
  if (!ROUTES.length) await loadRoutes();
  const route = ROUTES.find(r => r.id === routeId);
  if (!route) return showToast("Fant ikke ruten.");

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

// ------------------------------
// Lukker overlay
// ------------------------------
function closeRouteOverlay() {
  const ov = document.getElementById("routeOverlay");
  if (ov) ov.remove();
}

// ------------------------------
// Åpner sted direkte fra rute
// ------------------------------
function openPlaceById(id) {
  const p = PLACES.find(x => x.id === id);
  if (p) openPlaceCard(p);
  closeRouteOverlay();
}

// ------------------------------
// Tegner rute på kartet – fotrute med kategoriens farge
// ------------------------------
function focusRouteOnMap(routeId) {
  const route = ROUTES.find(r => r.id === routeId);
  if (!route || !MAP) return;

  // Finn fargen ut fra kategori (samme logikk som i app.js)
  const color = typeof catColor === "function" ? catColor(route.category || "") : "#9b59b6";

  // Hent koordinater fra steder
  const coords = route.stops
    .map(s => {
      const plc = PLACES.find(p => p.id === s.placeId);
      return plc ? [plc.lat, plc.lon] : null;
    })
    .filter(Boolean);

  if (!coords.length) return showToast("Ingen gyldige stopp funnet.");

  // Fjern tidligere rute hvis den finnes
  if (window.routeControl) {
    try { MAP.removeControl(window.routeControl); } catch(e) {}
    window.routeControl = null;
  }

  try {
    // 🥾 Bruk Leaflet Routing Machine for fotrute
    window.routeControl = L.Routing.control({
      waypoints: coords.map(c => L.latLng(c[0], c[1])),
      router: L.Routing.osrmv1({
        serviceUrl: "https://routing.openstreetmap.de/routed-foot/route/v1",
        profile: "foot"
      }),
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color, weight: 5, opacity: 0.9 }]
      },
      createMarker: () => null
    }).addTo(MAP);

    showToast(`🥾 Fotrute: ${route.name}`);
  } catch (e) {
    console.warn("Fotrute-feil:", e);
    showToast("Kunne ikke hente fotrute – viser rett linje.");
    const line = L.polyline(coords, { color, weight: 4 }).addTo(MAP);
    MAP.fitBounds(line.getBounds(), { padding: [60, 60] });
  }

  closeRouteOverlay();
}

function closeAllRoutes() {

  // 1) Fjern tematisk rute
  if (window.routeControl) {
    try { MAP.removeControl(window.routeControl); } catch(e) {}
    window.routeControl = null;
  }

  // 2) Fjern navigasjonsrute fra app.js
  if (window.navLine) {
    try { MAP.removeLayer(window.navLine); } catch(e) {}
    window.navLine = null;
  }
}


// ------------------------------
// Eksporter funksjoner til global scope
// ------------------------------
window.showRouteOverlay = showRouteOverlay;
window.loadRoutes = loadRoutes;
window.closeAllRoutes = closeAllRoutes;
