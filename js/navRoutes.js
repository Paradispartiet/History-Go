// js/navRoutes.js — Ekte gangrute: brukerposisjon -> valgt sted (ORS)
// Krever:
// - window.getPos() (fra pos.js)
// - window.MAP eller window.HGMap.getMap() (MapLibre)
// - window.showToast(msg) (valgfritt)

(function () {
  "use strict";

  // --- konfig ---
  const ORS = {
    baseUrl: "https://api.openrouteservice.org",
    // NB: apiKey må være ren streng. Ikke "apiKey: apiKey:" (det er en syntax-feil).
    apiKey: (window.HG_ORS && window.HG_ORS.apiKey) || "",
    profile: (window.HG_ORS && window.HG_ORS.profile) || "foot-walking"
  };

  // MapLibre ids
  const NAV_SRC = "hg-nav-route";
  const NAV_LINE = "hg-nav-route-line";

  function getMap() {
    return window.MAP || (window.HGMap && typeof window.HGMap.getMap === "function" ? window.HGMap.getMap() : null);
  }

  function clearNavRoute() {
    const map = getMap();
    if (!map) return;

    try {
      if (map.getLayer(NAV_LINE)) map.removeLayer(NAV_LINE);
      if (map.getSource(NAV_SRC)) map.removeSource(NAV_SRC);
    } catch (e) {
      // ignorer (map kan være midt i style reload)
    }
  }

  async function fetchRouteGeoJSON(from, to) {
    if (!ORS.apiKey) throw new Error("ORS apiKey mangler (window.HG_ORS.apiKey)");

    const url = `${ORS.baseUrl}/v2/directions/${encodeURIComponent(ORS.profile)}/geojson`;
    const body = {
      coordinates: [
        [Number(from.lon), Number(from.lat)],
        [Number(to.lon), Number(to.lat)]
      ]
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": ORS.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`ORS ${r.status}: ${txt || "request failed"}`);
    }

    return await r.json(); // GeoJSON
  }

  function drawRoute(geojson, { fit = true } = {}) {
    const map = getMap();
    if (!map) return;

    clearNavRoute();

    map.addSource(NAV_SRC, { type: "geojson", data: geojson });

    map.addLayer({
      id: NAV_LINE,
      type: "line",
      source: NAV_SRC,
      paint: {
        "line-color": "#00d1ff",
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5, 18, 8],
        "line-opacity": 0.95
      }
    });

    if (fit) {
      // Finn bounds fra LineString
      const coords =
        geojson?.features?.find(f => f?.geometry?.type === "LineString")?.geometry?.coordinates || [];

      if (coords.length) {
        const b = coords.reduce(
          (bb, c) => bb.extend(c),
          new maplibregl.LngLatBounds(coords[0], coords[0])
        );
        map.fitBounds(b, { padding: 60, maxZoom: 17 });
      }
    }
  }

  async function showNavRouteToPlace(place, opts = {}) {
    const map = getMap();
    if (!map) {
      window.showToast?.("Kart ikke klart ennå.");
      return;
    }

    const pos = window.getPos?.();
    if (!pos) {
      window.showToast?.("Fant ingen posisjon ennå.");
      return;
    }

    const toLat = Number(place?.lat);
    const toLon = Number(place?.lon);
    if (!Number.isFinite(toLat) || !Number.isFinite(toLon)) {
      window.showToast?.("Sted mangler koordinater.");
      return;
    }

    try {
      window.showToast?.("Beregner gangrute…");
      const geo = await fetchRouteGeoJSON(pos, { lat: toLat, lon: toLon });
      drawRoute(geo, { fit: true });

      // (valgfritt) litt info hvis ORS gir distance/duration
      const seg = geo?.features?.[0]?.properties?.segments?.[0];
      const distM = seg?.distance;
      const durS = seg?.duration;

      if (Number.isFinite(distM) && Number.isFinite(durS)) {
        const km = (distM / 1000).toFixed(1);
        const min = Math.round(durS / 60);
        window.showToast?.(`Gangrute: ${km} km · ca ${min} min`);
      } else {
        window.showToast?.("Gangrute vist på kartet");
      }
    } catch (e) {
      console.warn("[navRoutes]", e);
      window.showToast?.("Fant ingen rute ennå (ORS-feil).");
    }
  }

  // --- expose ---
  window.HGNavRoutes = {
    clear: clearNavRoute,
    showToPlace: showNavRouteToPlace
  };

  // Dette er funksjonen popup-utils.js nå prøver først:
  window.showNavRouteToPlace = (place, opts) => showNavRouteToPlace(place, opts);

})();
