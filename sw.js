// ============================================================
// === HISTORY GO – SW.JS (v1.0, offline + cache-first) =======
// ============================================================

const VERSION = "v1.0.16";
const STATIC_CACHE = `hg-static-${VERSION}`;
const RUNTIME_CACHE = `hg-runtime-${VERSION}`;

// Pre-cache av kjernefiler (må finnes i prosjektet ditt)
const CORE_ASSETS = [
  // HTML
  "/index.html",
  "/profile.html",

  // CSS (bruk den stien du faktisk har; denne matcher filene vi lagde)
  "/css/theme.css",

  // JS
  "/js/core.js",
  "/js/app.js",
  "/js/map.js",
  "/js/ui.js",
  "/js/quiz.js",
  "/js/profile.js",
  "/js/data.js",

  // Bilder (minst logoen + noen merkefiler er fint å ha offline)
  "/bilder/logo_historygo.PNG",
  "/bilder/merker/vitenskap.PNG",
  "/bilder/merker/kunst.PNG",
  "/bilder/merker/by.PNG",
  "/bilder/merker/litteratur.PNG",
  "/bilder/merker/musikk.PNG",
  "/bilder/merker/natur.PNG",
  "/bilder/merker/sport.PNG",
  "/bilder/merker/politikk.PNG",
  "/bilder/merker/populaerkultur.PNG",
  "/bilder/merker/subkultur.PNG"
];

// Install – legg kjernefilene i cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activate – rydd bort gamle cacher
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch-strategi:
//  - HTML: network-first (med fallback til cache for offline)
//  - JSON (data/quiz_*.json, places.json osv.): network-first + runtime-cache
//  - Øvrige statiske ressurser (CSS/JS/PNG): cache-first
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bare håndter samme origin
  if (url.origin !== self.location.origin) return;

  // HTML-dokumenter → network-first
  if (req.destination === "document" || req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  // Datafiler (JSON) → network-first (caches i runtime)
  if (url.pathname.startsWith("/data/") || req.headers.get("accept")?.includes("application/json")) {
    event.respondWith(networkFirst(req, true));
    return;
  }

  // Statiske ressurser → cache-first
  if (
    ["style", "script", "image", "font"].includes(req.destination) ||
    url.pathname.endsWith(".PNG") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Default: prøv cache-first
  event.respondWith(cacheFirst(req));
});

// -------- Hjelpefunksjoner --------

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirst(request, useRuntime = false) {
  const cacheName = useRuntime ? RUNTIME_CACHE : STATIC_CACHE;
  const cache = await caches.open(cacheName);

  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Fallback for HTML: returner index om mulig
    if (request.destination === "document") {
      const offline = await caches.match("/index.html");
      if (offline) return offline;
    }
    throw err;
  }
}
