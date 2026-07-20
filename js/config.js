window.HG_MAPTILER_KEY = "Yi8j8sLhEo4NyPygVmbN";
window.HG_NATURTRO_STYLE_ID = "streets-v4";

// Legacy bootstrap bridge only: the map-control implementation itself lives in
// TypeScript and is built to dist/web according to docs/TYPESCRIPT_FIRST_POLICY.md.
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
    script.src = "dist/web/map-controls-runtime.js";
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
