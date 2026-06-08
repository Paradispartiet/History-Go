document.addEventListener("DOMContentLoaded", async () => {
  document.body?.classList.remove("hg-loaded", "hg-load-failed");

  const releaseQueuedToasts = gateToastsUntilAppReady();

  try {
    // Kritiske globale index-runtimescripts. Rekkefølgen er bevisst og eksplisitt:
    // kjernemoduler → kartmotor → lister/venstrepanel, slik at bootCritical
    // og initLeftPanel har det de trenger før de kjøres. js/map.js MÅ være lastet
    // (og MapLibre tilgjengelig via index.html) før bootCritical initialiserer kartet.
    await safeRun("loadCategories", () => loadScriptOnce("js/core/categories.js"));
    await safeRun("loadGeo", () => loadScriptOnce("js/core/geo.js"));
    await safeRun("loadPos", () => loadScriptOnce("js/core/pos.js"));
    await safeRun("loadDom", () => loadScriptOnce("js/ui/dom.js"));
    await safeRun("loadMap", () => loadScriptOnce("js/map.js"));
    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));
    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));

    // PlaceCard-runtime: kjernen (LayerManager + bottomSheetController) før selve
    // place-card.js, og før MapView/AppRouter lastes – slik at window.openPlaceCard
    // (og collapse/expand-hookene som bruker LayerManager/bottomSheetController)
    // finnes når MapView.openPlace()/AppRouter forsøker å åpne et sted.
    await safeRun("loadLayerManager", () => loadScriptOnce("js/core/layerManager.js"));
    await safeRun("loadBottomSheetController", () => loadScriptOnce("js/core/bottomSheetController.js"));
    await safeRun("loadPopupUtils", () => loadScriptOnce("js/ui/popup-utils.js"));
    await safeRun("loadPlaceCard", () => loadScriptOnce("js/ui/place-card.js"));

    await safeRun("LayerManager.init", () => window.LayerManager?.init?.());
    await safeRun("bottomSheetController.init", () => window.bottomSheetController?.init?.());

    // DataHub MÅ lastes før boot-fast/bootCritical: boot-fast sin
    // loadPlacesCritical() bruker window.DataHub.loadPlacesBase (manifest/places_index)
    // som datakilde. Uten DataHub faller den tilbake til utdaterte PLACE_FILES_FALLBACK-
    // stier som ikke matcher dagens place-struktur, og window.PLACES ender som [].
    await safeRun("loadDataHub", () => loadScriptOnce("js/dataHub.js"));

    // Disse lastes fra app-entry for å slippe å gjøre index.html mer skjør.
    await safeRun("loadBootFast", () => loadScriptOnce("js/boot-fast.js"));
    await safeRun("loadMapView", () => loadScriptOnce("js/views/MapView.js"));
    await safeRun("loadAppRouter", () => loadScriptOnce("js/router/AppRouter.js"));

    // Critical boot gjør bare index brukbar: kart + places_index + markører.
    // Fallback til gammel boot() beholdes hvis boot-fast.js ikke er lastet.
    await safeRun("bootCritical", window.bootCritical || window.boot);
    await safeRun("wireMapPlacePopupInMapMode", wireMapPlacePopupInMapMode);

    await safeRun("initMiniProfile", window.initMiniProfile);
    await safeRun("wireMiniProfileLinks", window.wireMiniProfileLinks);
    await safeRun("initLeftPanel", window.initLeftPanel);
    await safeRun("wireBackgroundLeftPanelRerenders", wireBackgroundLeftPanelRerenders);

    // Lett sanity check: ikke marker appen som frisk hvis kritiske index-deler
    // (kartmotor eller venstrepanel) mangler. Feilen skal ikke skjules bak "hg-loaded".
    const runtimeError = assertCriticalIndexRuntime();
    if (runtimeError) throw runtimeError;

    markAppReady();
    releaseQueuedToasts();

    await safeRun("HGAppRouter.start", () => window.HGAppRouter?.start?.());

    // Ikke blokker app-ready på søk/ruter/tunge data.
    runAfterReady("loadGlobalSearch", () => loadScriptOnce("js/ui/search.js"));
    runAfterReady("HGRoutes.init", () => window.HGRoutes?.init?.());
    runAfterReady("bootBackground", window.bootBackground);

    if (window.HGPos?.request) {
      runAfterReady("HGPos.request", window.HGPos.request);
    }
  } catch (e) {
    markAppFailed(e);
  }
});

function assertCriticalIndexRuntime() {
  const missing = [];

  if (typeof window.maplibregl === "undefined") {
    missing.push("maplibregl (MapLibre GL JS) – sjekk <script>/<link> for maplibre-gl i index.html");
  }

  if (typeof window.HGMap !== "object" || !window.HGMap) {
    missing.push("HGMap (js/map.js) – kartmotoren er ikke lastet");
  }

  if (!window.MAP && !window.HGMap?.getMap?.()) {
    missing.push("MAP – kartet ble ikke initialisert (window.HGMap.initMap krever maplibregl)");
  }

  if (typeof window.initLeftPanel !== "function") {
    missing.push("initLeftPanel (js/ui/left-panel.js) – venstrepanelet er ikke lastet");
  }

  if (!document.getElementById("nearbyList")) {
    missing.push("#nearbyList – Nearby-containeren mangler i DOM");
  }

  if (missing.length === 0) return null;

  const error = new Error(
    "Kritiske index-runtimedeler mangler:\n- " + missing.join("\n- ")
  );
  console.error("[index runtime sanity check]", error.message);
  window.__HG_INDEX_RUNTIME_MISSING__ = missing;
  return error;
}

function markAppReady() {
  document.body?.classList.remove("hg-load-failed");
  document.body?.classList.add("hg-loaded");
  window.__HG_APP_READY__ = true;

  try {
    window.dispatchEvent(new CustomEvent("hg:appReady", {
      detail: { ready: true, ts: Date.now() }
    }));
  } catch {}
}

function markAppFailed(error) {
  console.error("[app startup failed]", error);

  window.__HG_APP_READY__ = false;
  window.__HG_APP_LOAD_ERROR__ = {
    message: String(error?.message || error),
    stack: error?.stack || null
  };

  document.body?.classList.add("hg-load-failed");
}

function gateToastsUntilAppReady() {
  const originalShowToast = window.showToast;
  const queue = [];
  let released = false;

  if (typeof originalShowToast !== "function") {
    return function noop() {};
  }

  window.showToast = function queuedShowToast(...args) {
    if (released || window.__HG_APP_READY__ || document.body?.classList.contains("hg-loaded")) {
      return originalShowToast.apply(window, args);
    }

    queue.push(args);
    return undefined;
  };

  return function releaseQueuedToasts() {
    if (released) return;
    released = true;
    window.showToast = originalShowToast;

    queue.forEach((args, index) => {
      setTimeout(() => {
        originalShowToast.apply(window, args);
      }, 260 + index * 350);
    });
  }
}

function routeToPlace(placeId) {
  const id = String(placeId || "").trim();
  if (!id) return;

  const next = `#/place/${encodeURIComponent(id)}`;
  if (window.HGAppRouter?.navigate) {
    window.HGAppRouter.navigate(next);
    return;
  }

  if (location.hash !== next) location.hash = next;
}

function wireBackgroundLeftPanelRerenders() {
  if (window.__HG_BACKGROUND_LEFT_PANEL_RERENDERS_BOUND__ === true) return;
  window.__HG_BACKGROUND_LEFT_PANEL_RERENDERS_BOUND__ = true;

  const activeMode = () =>
    document.querySelector(".nearby-tab.is-active")?.getAttribute("data-leftmode") || "nearby";

  window.addEventListener("hg:people-ready", () => {
    if (activeMode() === "people" && typeof window.renderNearbyPeople === "function") {
      window.renderNearbyPeople();
    }
  });

  window.addEventListener("hg:backgroundReady", () => {
    window.rerenderActiveLeftPanelMode?.();
  });
}

function wireMapPlacePopupInMapMode() {
  if (!window.HGMap || typeof window.HGMap.setOnPlaceClick !== "function") return;

  window.HGMap.setOnPlaceClick((id) => {
    const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find(
      (p) => String(p?.id || "").trim() === String(id || "").trim()
    );

    if (!place) return;

    routeToPlace(place.id);
  });
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve();

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing instanceof HTMLScriptElement) {
      if (existing.dataset.loaded === "1") return resolve();
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.loaded = "0";
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(`Kunne ikke laste ${src}`));
    document.body.appendChild(script);
  });
}

function runAfterReady(label, fn) {
  Promise.resolve()
    .then(() => safeRun(label, fn))
    .catch((e) => {
      console.warn(`[${label}] background failed`, e);
    });
}

async function safeRun(label, fn) {
  try {
    const out = fn?.();

    if (out && typeof out.then === "function") {
      return await out;
    }

    return out;
  } catch (e) {
    console.error(`[${label}]`, e);

    if (window.DEBUG) {
      window.__HG_LAST_ERROR__ = {
        label,
        message: String(e),
        stack: e?.stack || null
      };
    }

    throw e;
  }
}
