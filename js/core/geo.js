// ==============================
// GEO – POSISJON + AVSTAND
// Eier: geo.js
// Avhengig av: pos.js (HGPos)
// ==============================

// ---------- Avstand ----------
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

// ---------- Posisjon ----------
window.getPos = function () {
  return window.HG_POS || null;
};

function setPos(pos) {
  window.HG_POS = pos;
  window.HG_ENV = window.HG_ENV || {};
  window.HG_ENV.geo = "ok";

  // 🔑 KRITISK: rerender når posisjon faktisk kommer
  if (typeof window.renderNearbyPlaces === "function") {
    window.renderNearbyPlaces();
  }
}

// ---------- Request ----------
function requestLocation() {
  window.HG_ENV = window.HG_ENV || {};
  window.HG_ENV.geo = "unknown";

  // Første render: vis steder selv uten posisjon
  if (typeof window.renderNearbyPlaces === "function") {
    window.renderNearbyPlaces();
  }

  // Delegér til pos.js
  if (window.HGPos?.request) {
    window.HGPos.request({
      onSuccess: (coords) => {
        setPos({
          lat: coords.lat,
          lon: coords.lon,
          accuracy: coords.accuracy
        });
      },
      onError: () => {
        window.HG_ENV.geo = "denied";
        // behold nearby uten avstand
        if (typeof window.renderNearbyPlaces === "function") {
          window.renderNearbyPlaces();
        }
      }
    });
    return;
  }

  console.warn("[geo] HGPos.request mangler (pos.js ikke lastet)");
}

window.requestLocation = requestLocation;
