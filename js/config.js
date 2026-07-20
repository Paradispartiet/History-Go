window.HG_MAPTILER_KEY = "Yi8j8sLhEo4NyPygVmbN";
window.HG_NATURTRO_STYLE_ID = "streets-v4";

// Kartkontrollene må finnes før app-boot initialiserer LayerManager og HGMap.
// index.html mistet denne DOM-blokken i en tidligere shell-opprydding, så vi
// gjenoppretter verten tidlig og lar kart-runtime fylle resten.
(function loadMapControlsRuntime() {
  function ensureMapControlsHost() {
    if (!document.getElementById("mapLayer") || document.querySelector(".map-controls")) return;
    const controls = document.createElement("div");
    controls.className = "map-controls";
    controls.setAttribute("aria-label", "Kartkontroller");
    document.body.appendChild(controls);
  }

  function load() {
    ensureMapControlsHost();
    if (document.querySelector('script[data-hg-map-controls-runtime="1"]')) return;
    const script = document.createElement("script");
    script.src = "js/map-controls-runtime.js";
    script.async = false;
    script.dataset.hgMapControlsRuntime = "1";
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load, { once: true });
  } else {
    load();
  }
})();
