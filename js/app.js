document.addEventListener("DOMContentLoaded", async () => {
  document.body?.classList.remove("hg-loaded", "hg-load-failed");

  const releaseQueuedToasts = gateToastsUntilAppReady();

  try {
    await safeRun("boot", window.boot);
    await safeRun("wireMapPlacePopupInMapMode", wireMapPlacePopupInMapMode);

    // Globalt søk lå i repoet, men var ikke lastet inn av index.html.
    // Lastes etter boot slik at window.PLACES / window.PEOPLE / kategorier finnes.
    await safeRun("loadGlobalSearch", () => loadScriptOnce("js/ui/search.js"));

    await safeRun("initMiniProfile", window.initMiniProfile);
    await safeRun("wireMiniProfileLinks", window.wireMiniProfileLinks);
    await safeRun("initLeftPanel", window.initLeftPanel);
    await safeRun("HGRoutes.init", () => window.HGRoutes?.init?.());

    markAppReady();
    releaseQueuedToasts();

    if (window.HGPos?.request) {
      safeRun("HGPos.request", window.HGPos.request);
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
  };
}

function wireMapPlacePopupInMapMode() {
  if (!window.HGMap || typeof window.HGMap.setOnPlaceClick !== "function") return;

  window.HGMap.setOnPlaceClick((id) => {
    const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find(
      (p) => String(p?.id || "").trim() === String(id || "").trim()
    );

    if (!place || typeof window.showPlacePopup !== "function") return;
    window.showPlacePopup(place);
  });
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve();

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
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
