// boot.js



function requestLocation() {
  window.HG_ENV = window.HG_ENV || {};
  window.HG_ENV.geo = "unknown";

  // vis steder med "–" mens vi venter
  if (typeof renderNearbyPlaces === "function") renderNearbyPlaces();

  // pro: delegér alt til pos.js
  if (window.HGPos?.request) return window.HGPos.request();

  console.warn("[geo] HGPos.request mangler (pos.js ikke lastet?)");
}
