/* ============================================================
   HISTORY GO – SERVICE WORKER (GitHub Pages / subfolder-safe)
   Version: HG-FULL-v3.0.057
============================================================ */

const CACHE_VERSION = "HG-FULL-v3.0.239";
const STATIC_CACHE = `historygo-${CACHE_VERSION}`;

// Scope path (viktig på GitHub Pages: /History-Go/)
const SCOPE_PATH = new URL(self.registration.scope).pathname; // f.eks. "/History-Go/"

// Lager en URL som alltid peker riktig innenfor scope
function toScopedUrl(path) {
  // absolute URL
  if (/^https?:\/\//i.test(path)) return path;

  // hvis du sender inn "" eller "./" -> scope root
  if (!path || path === "./") return SCOPE_PATH;

  // allerede absolute path
  if (path.startsWith("/")) return path;

  // normal relative -> scope + relative
  return SCOPE_PATH + path;
}

// ---------- STATIC ASSETS ----------
const STATIC_ASSETS = [
  // HTML (innen scope)
  "", // scope root
  "index.html",
  "profile.html",
  "knowledge.html",
  "notater.html",

  // CSS
  "css/theme.css",
  "css/base.css",
  "css/layout.css",
  "css/components.css",
  "css/search.css",
  "css/nearby.css",
  "css/miniProfile.css",
  "css/profile.css",
  "css/merits.css",
  "css/quiz.css",
  "css/popups.css",
  "css/overlay.css",
  "css/effects.css",
  "css/map.css",
  "css/placeCard.css",
  "css/sheets.css",

  // Merker
  "merker/merker.html",
  "css/merker.css",

  // Console CSS
  "js/console/console.css",

  // JS (core)
  "js/popup-utils.js",
  "js/hgchips.js",
  "js/knowledge.js",
  "js/knowledge_component.js",
  "js/trivia.js",
  "js/hgInsights.js",
  "js/emnerLoader.js",
  "js/dataHub.js",
  "js/audits/imageRoles.audit.js",

  // Registry + health report
  "js/domainRegistry.js",
  "js/domainHealthReport.js",

  // Console JS
  "js/console/init.js",
  "js/console/verify.js",
  "js/console/diagnosticConsole.js",
  "js/console/devConsole.js",
   "js/console/legacyExtensions.js",
  // "js/console/terminal.js", // kun hvis den faktisk finnes

  // Resten
  "js/map.js",
  "js/quizzes.js",
  "js/routes.js",
  "js/app.js",

  // Data
  "data/places.json",
  "data/people.json",
  "data/tags.json",
  "data/badges.json",
  "data/routes.json",

  // Quiz-data (du kan evt. bytte til manifest senere)
  "data/quiz/manifest.json",
  "data/quiz/quiz_by.json",
  "data/quiz/quiz_historie.json",
  "data/quiz/quiz_kunst.json",
  "data/quiz/quiz_litteratur.json",
  "data/quiz/quiz_musikk.json",
  "data/quiz/quiz_naeringsliv.json",
  "data/quiz/quiz_natur.json",
  "data/quiz/quiz_politikk.json",
  "data/quiz/quiz_populaerkultur.json",
  "data/quiz/quiz_sport.json",
  "data/quiz/quiz_subkultur.json",
  "data/quiz/quiz_vitenskap.json",

  // UI-bilder
  "bilder/ui/historygo_logo.PNG",
  "bilder/ui/marker.PNG",
  "bilder/ui/badge_default.PNG",
  "bilder/logo_historygo.PNG"
].map(toScopedUrl);

// Helper: precache uten at install feiler på én manglende fil
async function safePrecache(cache, urls) {
  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        // cache: "reload" hjelper litt mot “stuck” assets i noen miljø
        await cache.add(new Request(url, { cache: "reload" }));
      } catch (e) {
        // ignorer (install skal ikke feile)
      }
    })
  );
}

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await safePrecache(cache, STATIC_ASSETS);
      await self.skipWaiting();
    })()
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("historygo-") && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // same-origin only
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";
  const isHTML =
    req.mode === "navigate" ||
    accept.includes("text/html");

  // HTML: network-first, fallback cache
  if (isHTML) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);

        // Cache key uten querystring (så /?dev=1 matcher /)
        const key = new Request(url.pathname, { method: "GET" });

        try {
          const fresh = await fetch(req);
          cache.put(key, fresh.clone());
          return fresh;
        } catch {
          // prøv først eksakt path uten query
          const cached = await cache.match(key, { ignoreSearch: true });
          if (cached) return cached;

          // fallback: index.html i scope
          const indexUrl = toScopedUrl("index.html");
          return (await cache.match(indexUrl)) || new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // Static: cache-first
  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      const cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return new Response("", { status: 504 });
      }
    })()
  );
});
