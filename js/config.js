window.HG_MAPTILER_KEY = "Yi8j8sLhEo4NyPygVmbN";
window.HG_NATURTRO_STYLE_ID = "streets-v4";

// index.html laster config.js tidlig i <head>, mens den fulle toast-runtime først
// lastes fra app.js. Behold derfor toast-kall som skjer i mellomtiden i stedet
// for å la optional window.showToast-kall forsvinne stille.
(function installEarlyToastBridge() {
  if (typeof window.showToast === "function") return;

  const queue = Array.isArray(window.__HG_EARLY_TOAST_QUEUE__)
    ? window.__HG_EARLY_TOAST_QUEUE__
    : [];
  window.__HG_EARLY_TOAST_QUEUE__ = queue;

  window.showToast = function earlyToastBridge(...args) {
    if (typeof window.__HG_REAL_SHOW_TOAST__ === "function") {
      return window.__HG_REAL_SHOW_TOAST__(...args);
    }

    queue.push(args);
    return undefined;
  };
})();

// Legacy bootstrap bridge only: the map-control implementation itself lives in
// TypeScript and is built to dist/web according to docs/TYPESCRIPT_FIRST_POLICY.md.
(function loadMapControlsRuntime() {
  function ensureMapControlsStyles() {
    if (document.querySelector('link[data-hg-map-controls-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/map-controls-flat.css";
    link.dataset.hgMapControlsStyle = "1";
    document.head.appendChild(link);
  }

  function ensureMapControlsHost() {
    if (!document.getElementById("mapLayer") || document.querySelector(".map-controls")) return;
    const controls = document.createElement("div");
    controls.className = "map-controls";
    controls.setAttribute("aria-label", "Kartkontroller");
    document.body.appendChild(controls);
  }

  function load() {
    ensureMapControlsStyles();
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

// Korrigerer den forrige feilendringen på PlaceCard-rundingene og legger den
// ønskede sorte ytterkanten på de faktiske stedsprikkene i kartet.
(function installMapPointBorderFix() {
  const PLACE_DOTS_LAYER = "hg-places-dots";
  const WRONG_PLACE_CARD_STYLE_ID = "hgPlaceCardRoundBorderStyle";
  let patchedApi = null;
  let boundMap = null;
  let retryTimer = null;

  function restorePlaceCardRounds() {
    document.getElementById(WRONG_PLACE_CARD_STYLE_ID)?.remove();
  }

  function applyBlackMapPointBorder() {
    const map = window.HGMap?.getMap?.();
    if (!map || typeof map.getLayer !== "function" || typeof map.setPaintProperty !== "function") {
      return false;
    }
    if (!map.getLayer(PLACE_DOTS_LAYER)) return false;

    try {
      map.setPaintProperty(PLACE_DOTS_LAYER, "circle-stroke-color", "#000000");
      return true;
    } catch {
      return false;
    }
  }

  function scheduleApply() {
    restorePlaceCardRounds();
    requestAnimationFrame(() => {
      restorePlaceCardRounds();
      applyBlackMapPointBorder();
    });
  }

  function wrapRedrawMethod(api, methodName) {
    const original = api?.[methodName];
    if (typeof original !== "function" || original.__hgBlackMapPointBorderWrapped) return;

    function wrappedMapRedraw(...args) {
      const result = original.apply(this, args);
      scheduleApply();
      return result;
    }

    wrappedMapRedraw.__hgBlackMapPointBorderWrapped = true;
    api[methodName] = wrappedMapRedraw;
  }

  function bindMapEvents(map) {
    if (!map || boundMap === map || typeof map.on !== "function") return;
    boundMap = map;

    map.on("load", scheduleApply);
    map.on("style.load", () => {
      if (typeof map.once === "function") map.once("idle", scheduleApply);
      setTimeout(scheduleApply, 0);
    });
  }

  function attach() {
    restorePlaceCardRounds();

    const api = window.HGMap;
    if (!api) return false;

    if (patchedApi !== api) {
      ["setPlaces", "setVisited", "setCatColor", "maybeDrawMarkers", "refreshMarkers"]
        .forEach((methodName) => wrapRedrawMethod(api, methodName));
      patchedApi = api;
    }

    bindMapEvents(api.getMap?.());
    scheduleApply();
    return true;
  }

  function start() {
    restorePlaceCardRounds();

    let attempts = 0;
    retryTimer = setInterval(() => {
      attempts += 1;
      const attached = attach();
      const applied = applyBlackMapPointBorder();

      if ((attached && applied) || attempts >= 200) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
    }, 50);
  }

  const headObserver = new MutationObserver(restorePlaceCardRounds);
  headObserver.observe(document.head, { childList: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
