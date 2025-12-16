/* ============================================================
   HISTORY GO – SERVICE WORKER (paths fixed for /css /js /data)
   Version: HG-FULL-v3.0.5
============================================================ */

const CACHE_VERSION = "HG-FULL-v3.0.9";
const STATIC_CACHE = `historygo-${CACHE_VERSION}`;

// Viktig: bruk ABSOLUTTE paths når du har mapper (/css, /js, /data)
const STATIC_ASSETS = [
  // HTML
  "/",
  "/index.html",
  "/profile.html",
  "/knowledge.html",
  "/notater.html",

  // CSS
  "/css/theme.css",
  "/css/profile.css",
  "/css/knowledge.css",
  "/css/style.css",

  // Merker
  "/merker/merker.html",
  "/css/merker.css",

  // JS
  "/js/app.js",
  "/js/map.js",
  "/js/quizzes.js",
  "/js/popup-utils.js",
  "/js/profile.js",
  "/js/knowledge.js",
  "/js/trivia.js",
  "/js/hgInsights.js",
  "/js/emnerLoader.js",
  "/js/routes.js",

  // Data
  "/data/places.json",
  "/data/people.json",
  "/data/tags.json",
  "/data/badges.json",
  "/data/routes.json",

  // Quiz-data
  "/data/quiz/quiz_by.json",
  "/data/quiz/quiz_historie.json",
  "/data/quiz/quiz_kunst.json",
  "/data/quiz/quiz_litteratur.json",
  "/data/quiz/quiz_musikk.json",
  "/data/quiz/quiz_naeringsliv.json",
  "/data/quiz/quiz_natur.json",
  "/data/quiz/quiz_politikk.json",
  "/data/quiz/quiz_populaerkultur.json",
  "/data/quiz/quiz_sport.json",
  "/data/quiz/quiz_subkultur.json",
  "/data/quiz/quiz_vitenskap.json",

  // UI-bilder (juster hvis du har flyttet disse)
  "/bilder/ui/historygo_logo.PNG",
  "/bilder/ui/marker.PNG",
  "/bilder/ui/badge_default.PNG"
];

// Helper: add assets uten at hele install feiler hvis én fil mangler
async function safePrecache(cache, urls) {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      try {
        await cache.add(url);
      } catch (e) {
        // Ikke fail install – bare hopp over den fila
      }
    })
  );
  return results;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await safePrecache(cache, STATIC_ASSETS);
      await self.skipWaiting();
    })()
  );
});

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

// Fetch-strategi:
// - HTML: network-first (så du slipper “låst” gammel app)
// - Static (css/js/json/images): cache-first
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // bare håndter same-origin
  if (url.origin !== self.location.origin) return;

  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(STATIC_CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached || caches.match("/index.html");
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || new Response("", { status: 504 });
      }
    })()
  );
});
