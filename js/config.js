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

// app.js starter sin loadScriptOnce-kjede fra DOMContentLoaded. Scripts som allerede
// står i dokumentet på dette tidspunktet har fullført parser-/head-lastingen, men de
// har historisk ikke fått data-hg-loaded. Da kan loadScriptOnce registrere en ny
// load-listener etter at load-eventet allerede har skjedd og vente for alltid.
// Marker kun ekte, eksekverende scripts; de bevisste post-ready-placeholderne holdes utenfor.
(function markExistingScriptsLoadedBeforeAppBoot() {
  const mark = () => {
    for (const script of Array.from(document.scripts || [])) {
      if (!script.getAttribute("src")) continue;
      if (script.dataset.hgPostReadyPlaceholder === "1") continue;
      if (script.type === "application/x-history-go-deferred") continue;
      script.dataset.hgLoaded = "1";
    }
    window.__HG_EXISTING_SCRIPTS_MARKED_LOADED__ = true;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mark, { once: true });
  } else {
    mark();
  }
})();

// index.html har en legacy post-ready-kjede som ellers begynner å laste mange
// sekundære scripts idet hg:appReady fyres. På iPad/Safari kan den synkrone
// script-eksekveringen treffe akkurat når onboardingen lukkes og gjøre UI-et
// tilsynelatende frosset. Legg derfor inn ikke-eksekverende placeholders tidlig;
// index-kjeden ser at src finnes og hopper over dem, mens denne koordinatoren
// laster filene én om gangen etter at første interaktive bilde har fått ro.
(function installPacedPostReadyRuntime() {
  const scripts = [
    "js/debug/HGTestMode.js",
    "js/i18n.js",
    "dist/web/knowledge.js",
    "dist/web/hgInsights.js",
    "dist/web/knowledgeV2.js",
    "js/hgSocialGuards.js",
    "js/knowledgeMatch.js",
    "js/progress/profileProgressReader.js",
    "js/ui/place-card-status-surface.js",
    "js/ui/place-language-layer.js",
    "js/ui/sprakatlas-map-experience-v3.js",
    "js/ui/sprakatlas-collection-v4.js",
    "js/ui/place-popup-direct-tabs.js",
    "js/ui/header-menu.js",
    "js/ui/psychology-room-entry.js",
    "js/ui/badges.js",
    "js/ui/personal-collection-map-bridge.js"
  ];

  const placeholderType = "application/x-history-go-deferred";
  const installed = [];

  for (const src of scripts) {
    if (document.querySelector(`script[src="${src}"]`)) continue;
    const placeholder = document.createElement("script");
    placeholder.type = placeholderType;
    placeholder.src = src;
    placeholder.dataset.hgPostReadyPlaceholder = "1";
    document.head.appendChild(placeholder);
    installed.push(src);
  }

  function schedule(task) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(task, { timeout: 1200 });
    } else {
      setTimeout(task, 80);
    }
  }

  function loadAt(index) {
    if (index >= installed.length) return;
    schedule(() => {
      const src = installed[index];
      const placeholder = Array.from(document.scripts || []).find((script) =>
        script.dataset.hgPostReadyPlaceholder === "1" && script.getAttribute("src") === src
      );
      placeholder?.remove();
      if (document.querySelector(`script[src="${src}"]`)) {
        setTimeout(() => loadAt(index + 1), 40);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.dataset.hgPostReadyPaced = "1";

      let done = false;
      const next = () => {
        if (done) return;
        done = true;
        script.dataset.hgLoaded = "1";
        setTimeout(() => loadAt(index + 1), 40);
      };

      script.onload = next;
      script.onerror = () => {
        console.warn("[post-ready paced] kunne ikke laste", src);
        next();
      };
      document.body.appendChild(script);
      setTimeout(next, 8000);
    });
  }

  window.addEventListener("hg:appReady", () => {
    setTimeout(() => loadAt(0), 1400);
  }, { once: true });
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load, { once: true });
  else load();
})();

// People-popup V2 is a presentation override.
(function loadPersonPopupV2Runtime() {
  function ensureStyle() {
    if (document.querySelector('link[data-hg-person-popup-v2-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/person-popup-v2.css";
    link.dataset.hgPersonPopupV2Style = "1";
    document.head.appendChild(link);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensureStyle, { once: true });
  else ensureStyle();

  if (document.querySelector('script[data-hg-person-popup-v2-runtime="1"]')) return;
  const script = document.createElement("script");
  script.src = "js/ui/person-popup-v2.js";
  script.async = false;
  script.dataset.hgPersonPopupV2Runtime = "1";
  document.head.appendChild(script);
})();