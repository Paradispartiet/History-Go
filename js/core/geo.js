// ==============================
// GEO – AVSTAND / BEREGNING
// ==============================
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

// global eksponering (samme mønster som resten)
window.distMeters = distMeters;


function requestLocation() {
  window.HG_ENV = window.HG_ENV || {};
  window.HG_ENV.geo = "unknown";

  // vis steder med "–" mens vi venter
  if (typeof renderNearbyPlaces === "function") renderNearbyPlaces();

  // pro: delegér alt til pos.js
  if (window.HGPos?.request) return window.HGPos.request();

  console.warn("[geo] HGPos.request mangler (pos.js ikke lastet?)");
}
