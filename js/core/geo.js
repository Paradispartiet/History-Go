// ==============================
// GEO – HJELPEFUNKSJONER
// Eier: geo.js
// Avhengig av: pos.js (HGPos)
// ==============================

// ---------- Avstand i meter ----------
function distMeters(a, b) {
  const aLat = Number(a?.lat);
  const aLon = Number(a?.lon);
  const bLat = Number(b?.lat);
  const bLon = Number(b?.lon);

  if (![aLat, aLon, bLat, bLon].every(Number.isFinite)) return Infinity;

  const R = 6371e3;
  const toRad = d => d * Math.PI / 180;

  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const la1 = toRad(aLat);
  const la2 = toRad(bLat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

window.distMeters = distMeters;

// ---------- Request location (delegér!) ----------
function requestLocation() {
  // Første render: vis steder selv uten pos
  if (typeof window.renderNearbyPlaces === "function") {
    window.renderNearbyPlaces();
  }

  // ÉN vei: via pos.js
  if (window.HGPos?.request) {
    return window.HGPos.request();
  }

  console.warn("[geo] HGPos.request mangler (pos.js ikke lastet?)");
}

window.requestLocation = requestLocation;
