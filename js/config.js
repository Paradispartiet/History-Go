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

// Startup watchdog: index-boot består av mange dynamiske script- og datakall.
// På særlig iOS/Safari kan en gammel service worker eller et hengende nettverkskall
// la ett av disse kallene stå pending for alltid. app.js får da aldri satt hg-loaded,
// og brukeren blir stående på «Laster History Go» selv om deler av appen er klare.
//
// Første timeout gjør én kontrollert cache/SW-recovery og reload. Dersom også den
// direkte reloaden stopper, frigjøres loaderen og brukeren får en eksplisitt retry
// i stedet for en evig spinner. Ingen normal oppstart påvirkes.
(function installStartupWatchdog() {
  const WATCHDOG_MS = 12000;
  const RECOVERY_KEY = "hg_startup_recovery_attempted_v1";
  let timer = null;

  function isIndexApp() {
    return document.body?.classList?.contains("hg-app");
  }

  function clearTimer() {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function releaseLoaderWithRetry() {
    const body = document.body;
    if (!body) return;

    body.classList.add("hg-loaded", "hg-load-failed", "hg-startup-timeout");
    window.__HG_APP_READY__ = false;
    window.__HG_STARTUP_WATCHDOG__ = {
      timedOut: true,
      ts: Date.now(),
      lastError: window.__HG_LAST_ERROR__ || window.__HG_APP_LOAD_ERROR__ || null
    };

    if (document.getElementById("hgStartupRecovery")) return;

    const panel = document.createElement("div");
    panel.id = "hgStartupRecovery";
    panel.setAttribute("role", "alert");
    panel.style.cssText = [
      "position:fixed",
      "left:50%",
      "bottom:calc(92px + env(safe-area-inset-bottom,0px))",
      "transform:translateX(-50%)",
      "z-index:2147483647",
      "width:min(420px,calc(100vw - 28px))",
      "box-sizing:border-box",
      "padding:14px 16px",
      "border:1px solid rgba(255,255,255,.22)",
      "border-radius:16px",
      "background:rgba(8,10,14,.96)",
      "color:#fff",
      "font:600 14px/1.35 system-ui,-apple-system,Segoe UI,sans-serif",
      "box-shadow:0 18px 50px rgba(0,0,0,.45)"
    ].join(";");
    panel.innerHTML = '<div style="font-weight:850;margin-bottom:5px">History Go brukte for lang tid på å starte</div>' +
      '<div style="opacity:.75;margin-bottom:10px">Last inn på nytt. Hvis problemet skyldtes gammel app-cache, er den allerede ryddet.</div>' +
      '<button type="button" style="min-height:38px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:#f6c800;color:#111;font-weight:850">Last inn på nytt</button>';
    panel.querySelector("button")?.addEventListener("click", () => location.reload());
    document.body.appendChild(panel);
  }

  async function clearHistoryGoCaches() {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));
      }
    } catch (error) {
      console.warn("[startup-watchdog] service worker cleanup failed", error);
    }

    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys
          .filter((key) => String(key).startsWith("hg-"))
          .map((key) => caches.delete(key).catch(() => false)));
      }
    } catch (error) {
      console.warn("[startup-watchdog] cache cleanup failed", error);
    }
  }

  async function recover() {
    if (!isIndexApp() || window.__HG_APP_READY__ === true || document.body?.classList.contains("hg-loaded")) return;

    const attempted = sessionStorage.getItem(RECOVERY_KEY) === "1";
    if (!attempted) {
      sessionStorage.setItem(RECOVERY_KEY, "1");
      window.__HG_STARTUP_WATCHDOG__ = { timedOut: true, recovering: true, ts: Date.now() };
      await clearHistoryGoCaches();

      const url = new URL(location.href);
      url.searchParams.set("hg-recover", String(Date.now()));
      location.replace(url.toString());
      return;
    }

    releaseLoaderWithRetry();
  }

  function arm() {
    if (!isIndexApp()) return;
    clearTimer();
    timer = setTimeout(() => { recover().catch(releaseLoaderWithRetry); }, WATCHDOG_MS);
  }

  window.addEventListener("hg:appReady", () => {
    clearTimer();
    try { sessionStorage.removeItem(RECOVERY_KEY); } catch {}
    document.getElementById("hgStartupRecovery")?.remove();
  }, { once: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arm, { once: true });
  } else {
    arm();
  }
})();

// Load city packages from the central registry without coupling them to an
// existing city-specific manifest.
(function loadCityPackageRuntime() {
  if (document.querySelector('script[data-hg-city-package-runtime="1"]')) return;
  const script = document.createElement("script");
  script.src = "js/data/city-package-loader.js";
  script.async = false;
  script.dataset.hgCityPackageRuntime = "1";
  document.head.appendChild(script);
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

// People-popup V2 is a presentation override. The runtime may load early because
// it polls until popup-utils has installed the legacy popup functions. Styling is
// appended only after the document is parsed, so it comes after popups.css and
// popup-polish.css and can reliably own the V2 layout.
(function loadPersonPopupV2Runtime() {
  function ensureStyle() {
    if (document.querySelector('link[data-hg-person-popup-v2-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/person-popup-v2.css";
    link.dataset.hgPersonPopupV2Style = "1";
    document.head.appendChild(link);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureStyle, { once: true });
  } else {
    ensureStyle();
  }

  if (document.querySelector('script[data-hg-person-popup-v2-runtime="1"]')) return;
  const script = document.createElement("script");
  script.src = "js/ui/person-popup-v2.js";
  script.async = false;
  script.dataset.hgPersonPopupV2Runtime = "1";
  document.head.appendChild(script);
})();