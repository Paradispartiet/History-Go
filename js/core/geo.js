// js/core/geo.js
// ==============================
// GEO – AVSTAND (INGEN POSISJON)
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

window.distMeters = distMeters;


(function () {

  let currentPos = null;

  window.getPos = function () {
    return currentPos;
  };

  window.requestLocation = function () {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentPos = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };

        console.log("Location set:", currentPos);

        if (typeof renderNearbyPlaces === "function") {
          renderNearbyPlaces();
        }

        if (typeof window.HGMap?.setUserMarker === "function") {
          window.HGMap.setUserMarker(currentPos);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true
      }
    );
  };

})();
