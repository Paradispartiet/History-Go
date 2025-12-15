// ─────────────────────────────────────────────
// NAVIGASJON: rute fra bruker/START → valgt place
// ─────────────────────────────────────────────

const HG_NAV_ROUTE_ID = "hg-route";

function clearNavRoute() {
  if (!window.MAP) return;
  if (MAP.getLayer(HG_NAV_ROUTE_ID)) MAP.removeLayer(HG_NAV_ROUTE_ID);
  if (MAP.getSource(HG_NAV_ROUTE_ID)) MAP.removeSource(HG_NAV_ROUTE_ID);
}

async function showRouteTo(place) {
  if (!window.MAP || !place) return;

  // from = userPos (fra setUser) eller START
  const from = window.userPos
    ? [userPos.lon, userPos.lat]
    : [START.lon, START.lat];

  const to = [place.lon, place.lat];

  clearNavRoute();

  try {
    const url =
      `https://routing.openstreetmap.de/routed-foot/route/v1/foot/` +
      `${from[0]},${from[1]};${to[0]},${to[1]}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("route http " + res.status);
    const json = await res.json();

    const coords = json?.routes?.[0]?.geometry?.coordinates;
    if (!coords || !coords.length) throw new Error("no geometry");

    MAP.addSource(HG_NAV_ROUTE_ID, {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: coords } }
    });

    MAP.addLayer({
      id: HG_NAV_ROUTE_ID,
      type: "line",
      source: HG_NAV_ROUTE_ID,
      paint: {
        "line-color": "#cfe8ff",
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5, 18, 8],
        "line-opacity": 1
      }
    });

    // zoom til ruten
    const b = coords.reduce(
      (bb, c) => bb.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );
    MAP.fitBounds(b, { padding: 40 });

    window.showToast?.("Rute lagt.");
  } catch (e) {
    // fallback: rett linje
    MAP.addSource(HG_NAV_ROUTE_ID, {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [from, to] } }
    });

    MAP.addLayer({
      id: HG_NAV_ROUTE_ID,
      type: "line",
      source: HG_NAV_ROUTE_ID,
      paint: {
        "line-color": "#cfe8ff",
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5, 18, 8],
        "line-opacity": 1
      }
    });

    const b = new maplibregl.LngLatBounds(from, from).extend(to);
    MAP.fitBounds(b, { padding: 40 });

    window.showToast?.("Vis linje (ingen rutetjeneste)");
  }
}

// Eksponer slik app.js kan kalle
window.showRouteTo = showRouteTo;
window.clearNavRoute = clearNavRoute;
