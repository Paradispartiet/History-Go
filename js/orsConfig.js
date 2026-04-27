window.HG_ORS = {
  baseUrl: "https://api.openrouteservice.org",
  apiKey: "eyJvcmciOiJIYjNjZTMl0Tc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1NjAxMzZmNDg0ZDQ0NzM4OTFlMWU1ODJjMjE5NzIi...",
  profile: "foot-walking"
};

// Midlertidig trygg bootstrap for place-level naturmapping.
// Selve logikken ligger isolert i js/nature_place_map_bridge.js.
(function () {
  if (window.__HG_NATURE_PLACE_BRIDGE_LOADER__) return;
  window.__HG_NATURE_PLACE_BRIDGE_LOADER__ = true;

  const script = document.createElement("script");
  script.src = "js/nature_place_map_bridge.js";
  script.defer = true;
  script.dataset.role = "nature-place-map-bridge";

  const current = document.currentScript;
  if (current && current.parentNode) {
    current.parentNode.insertBefore(script, current.nextSibling);
  } else {
    document.head.appendChild(script);
  }
})();
