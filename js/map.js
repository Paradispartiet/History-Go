// ============================================================
// === HISTORY GO – MAP.JS (v3.4, dag under natt + lysruter) ===
// ============================================================
//
//  • Nattkart over dagkart (dag synlig under ruten)
//  • Ruter fremheves med lysende daglys-effekt og glød
//  • Bevarer alle funksjoner: markører, puls, quiz, nærhet
// ============================================================

const map = (() => {
  let leafletMap;
  let markers = {};

b// ----------------------------------------------------------
// 2) MARKØRER (oppdatert for v3.7 med hover og debug-trygghet)
// ----------------------------------------------------------
function drawPlaceMarkers(places = []) {
  if (!leafletMap || !Array.isArray(places)) {
    console.warn("❗ drawPlaceMarkers: leafletMap eller places mangler");
    return;
  }

  // Fjern gamle markører hvis noen finnes
  Object.values(markers).forEach(m => leafletMap.removeLayer(m));
  markers = {};

  const visited = load("visited_places", []);
  const visitedIds = visited.map(v => v.id);

  places.forEach(p => {
    if (!p.lat || !p.lon) {
      console.warn(`⚠️ Ugyldige koordinater for sted: ${p.name}`);
      return;
    }

    const color = catColor(p.category);
    const visitedHere = visitedIds.includes(p.id);

    // Lag ikon
    const icon = L.divIcon({
      className: "place-marker",
      html: `<div style="
        background:${color};
        border:${visitedHere ? '2px solid #fff' : '2px solid transparent'};
        box-shadow:${visitedHere ? '0 0 8px #fff5' : '0 0 5px rgba(0,0,0,.4)'};
        width:14px; height:14px; border-radius:50%;
        transition: transform .15s ease;
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    // Lag markør og popup
    const m = L.marker([p.lat, p.lon], { icon }).addTo(leafletMap);
    const popupHTML = `
      <strong>${p.name}</strong><br>
      <small>${p.category || ""}</small><br><br>
      <button class="popup-quiz-btn" data-id="${p.id}">Ta quiz</button>
      <button class="popup-map-btn" data-id="${p.id}" style="margin-left:6px;">Se på kart</button>
    `;

    m.bindPopup(popupHTML);

    // Popup-handlinger
    m.on("popupopen", e => {
      const node = e.popup._contentNode;
      const quizBtn = node.querySelector(".popup-quiz-btn");
      const mapBtn = node.querySelector(".popup-map-btn");

      if (quizBtn) {
        quizBtn.onclick = () => {
          e.popup._close();
          if (window.quiz?.startQuiz) quiz.startQuiz(p.id);
        };
      }
      if (mapBtn) {
        mapBtn.onclick = () => {
          e.popup._close();
          if (window.map?.focusOnPlace) map.focusOnPlace(p.id);
        };
      }
    });

    // Klikk og hover-effekter
    m.on("click", () => handlePlaceClick(p.id));
    m.on("mouseover", () => m._icon.querySelector("div").style.transform = "scale(1.4)");
    m.on("mouseout",  () => m._icon.querySelector("div").style.transform = "scale(1)");

    markers[p.id] = m;
  });

  console.log(`📍 Tegnet ${Object.keys(markers).length} steder på kartet`);
}
// ----------------------------------------------------------
// 3) TRYKK PÅ STED (viser info, oppdaterer profil, logger event)
// ----------------------------------------------------------
function handlePlaceClick(placeId) {
  const pl = (HG?.data?.places || []).find(x => x.id === placeId);
  if (!pl) {
    console.warn(`⚠️ Fant ikke sted med id: ${placeId}`);
    return;
  }

  // Puls på markøren
  pulseMarker(placeId);

  // Vis toast med stedets navn og kategori
  ui?.showToast?.(`📍 ${pl.name} (${pl.category || "ukjent"})`);

  // Oppdater besøksliste i localStorage hvis ikke fra før
  const visited = load("visited_places", []);
  const already = visited.some(v => v.id === placeId);
  if (!already) {
    visited.push({
      id: pl.id,
      name: pl.name,
      category: pl.category,
      lat: pl.lat,
      lon: pl.lon,
      year: pl.year || null,
      date: new Date().toISOString()
    });
    save("visited_places", visited);
    window.dispatchEvent(new Event("updateProfile"));
  }

  // Aktiver event for andre moduler
  document.dispatchEvent(new CustomEvent("placeSelected", { detail: { placeId } }));

  // Logg til konsollen (diagnose)
  if (window.HGConsole) HGConsole.log(`📍 Klikket på sted: ${pl.name}`, "cmd");

  // Fokusér på kartet (myk animasjon)
  if (leafletMap && pl.lat && pl.lon) {
    leafletMap.flyTo([pl.lat, pl.lon], 16, { duration: 1.2 });
  }
}
  // ----------------------------------------------------------
  // 4) VISUELLE EFFEKTER (PULS)
  // ----------------------------------------------------------
  function pulseMarker(id) {
    const el = markers[id]?._icon?.querySelector("div");
    if (!el) return;
    el.animate(
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(1.5)", opacity: 0.4 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 700, easing: "ease-out" }
    );
  }

  // ----------------------------------------------------------
  // 5) NÆRHET & HJELPERE
  // ----------------------------------------------------------
  function highlightNearbyPlaces(lat, lon, radius = 150) {
    const nearby = (HG?.data?.places || []).filter((p) => {
      const d = distance(lat, lon, p.lat, p.lon);
      return d <= radius;
    });
    nearby.forEach((p) => pulseMarker(p.id));
  }

  function load(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) || def; }
    catch { return def; }
  }

  function distance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ----------------------------------------------------------
  // 6) FARGER (KATEGORI / BADGE)
  // ----------------------------------------------------------
  function catColor(cat = "") {
    const c = cat.toLowerCase();
    if (c.includes("historie")) return "#344B80";
    if (c.includes("vitenskap")) return "#9b59b6";
    if (c.includes("kunst")) return "#ffb703";
    if (c.includes("musikk")) return "#ff66cc";
    if (c.includes("litteratur")) return "#f6c800";
    if (c.includes("natur")) return "#4caf50";
    if (c.includes("sport")) return "#2a9d8f";
    if (c.includes("by")) return "#e63946";
    if (c.includes("politikk")) return "#c77dff";
    if (c.includes("populaerkultur")) return "#ff6f00";
    if (c.includes("subkultur")) return "#00c2ff";
    return "#FFD600";
  }

  // ----------------------------------------------------------
  // 7) FOKUSER PÅ STED (“Se på kart”)
  // ----------------------------------------------------------
  function focusOnPlace(placeId) {
    const pl = (HG?.data?.places || []).find(p => p.id === placeId);
    if (pl && leafletMap) {
      leafletMap.setView([pl.lat, pl.lon], 16);
      pulseMarker(placeId);
    }
  }
// ----------------------------------------------------------
// VIS RUTE PÅ KART – ekte gangvei + låst tykkelse
// ----------------------------------------------------------

// ----------------------------------------------------------
// FJERN EKSISTERENDE RUTE
// ----------------------------------------------------------
function clearActiveRoute() {
  ['_activeGlow', '_activeLineOuter', '_activeLineInner'].forEach(k => {
    if (map[k]) {
      leafletMap.removeLayer(map[k]);
      map[k] = null;
    }
  });
}
  
async function showRouteNow(route) {
  if (!route || !leafletMap) return;
ui?.showToast?.("⏳ Henter rute...");
  // Fjern tidligere rute
  clearActiveRoute();

  // 1. Hent koordinater for stedene i ruten
  const coordPairs = (route.stops || [])
    .map(s => {
      const pl = HG.data.places.find(p => p.id === s.placeId);
      return pl ? [pl.lon, pl.lat] : null; // lon, lat (for OSRM)
    })
    .filter(Boolean);

  if (coordPairs.length < 2) return;

  // 2. Hent ekte gangrute fra OSRM (OpenStreetMap)
  const query = coordPairs.map(c => c.join(',')).join(';');
  const url = `https://router.project-osrm.org/route/v1/foot/${query}?overview=full&geometries=geojson`;
  let walkCoords = [];
  try {
    const res = await fetch(url);
    const json = await res.json();
    walkCoords = json.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
  } catch (err) {
    console.warn("Kunne ikke hente fotrute:", err);
    // Fallback til rett linje mellom punktene
    walkCoords = coordPairs.map(c => [c[1], c[0]]);
  }

  // 3. Tegn lagene (i shadowPane = fast tykkelse)
  map._activeGlow = L.polyline(walkCoords, {
    color: "#fffbe6",
    weight: 30,
    opacity: 0.08,
    pane: 'shadowPane',
    lineJoin: "round",
    lineCap: "round"
  }).addTo(leafletMap);

  map._activeLineOuter = L.polyline(walkCoords, {
    color: "#fff6b0",
    weight: 8,
    opacity: 0.22,
    pane: 'shadowPane',
    lineJoin: "round",
    lineCap: "round"
  }).addTo(leafletMap);

  map._activeLineInner = L.polyline(walkCoords, {
    color: "#ffe97f",
    weight: 4,
    opacity: 0.9,
    pane: 'shadowPane',
    lineJoin: "round",
    lineCap: "round"
  }).addTo(leafletMap);

  // 4. Zoom pent til hele ruten
  leafletMap.fitBounds(L.latLngBounds(walkCoords).pad(0.2));

  console.log(`🥾 Fotrute aktivert: ${route.name}`);
}

  

  // ----------------------------------------------------------
  // 9) EKSPORT
  // ----------------------------------------------------------
  return {
    initMap,
    focusOnPlace,
    pulseMarker,
    highlightNearbyPlaces,
    showRouteNow
  };
})();
