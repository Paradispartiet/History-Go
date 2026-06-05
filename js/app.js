document.addEventListener("DOMContentLoaded", async () => {
  document.body?.classList.remove("hg-loaded", "hg-load-failed");

  const releaseQueuedToasts = gateToastsUntilAppReady();

  try {
    // Disse lastes fra app-entry for å slippe å gjøre index.html mer skjør.
    await safeRun("loadBootFast", () => loadScriptOnce("js/boot-fast.js"));
    await safeRun("loadMapView", () => loadScriptOnce("js/views/MapView.js"));
    await safeRun("loadProfileView", () => loadScriptOnce("js/views/ProfileView.js"));
    await safeRun("loadAppRouter", () => loadScriptOnce("js/router/AppRouter.js"));

    // Critical boot gjør bare index brukbar: kart + places_index + markører.
    // Fallback til gammel boot() beholdes hvis boot-fast.js ikke er lastet.
    await safeRun("bootCritical", window.bootCritical || window.boot);
    await safeRun("wireMapPlacePopupInMapMode", wireMapPlacePopupInMapMode);

    await safeRun("initMiniProfile", window.initMiniProfile);
    await safeRun("wireMiniProfileLinks", window.wireMiniProfileLinks);
    await safeRun("initLeftPanel", window.initLeftPanel);
    await safeRun("wireBackgroundLeftPanelRerenders", wireBackgroundLeftPanelRerenders);

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
