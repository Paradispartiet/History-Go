/* ============================================================
   History Go – Service Worker (precache fra index.html)
   Oppdatert: 2026-02-10
   ============================================================ */

const SW_VERSION = "hg-sw-2026-02-10-v1.0.15";

const CACHE_STATIC  = `hg-static-${SW_VERSION}`;
const CACHE_RUNTIME = `hg-runtime-${SW_VERSION}`;

// ✅ Dette er alle lokale assets jeg fant referert i index (129).html
const PRECACHE_URLS = [
  "./",
  "./index.html",

  "css/base.css",
  "css/components.css",
  "css/effects.css",
  "css/layout.css",
  "css/map.css",
  "css/merits.css",
  "css/miniProfile.css",
  "css/nearby.css",
  "css/overlay.css",
  "css/placeCard.css",
  "css/popups.css",
  "css/profile.css",
  "css/quiz.css",
  "css/routes.css",
  "css/search.css",
  "css/wonderkammer.css",
  "js/console/console.css",

  "js/sw-register.js",

  "js/ui/popup-utils.js",
  "js/ui/place-card.js",
  "js/hgchips.js",

  "js/knowledge.js",
  "js/knowledge_component.js",
  "js/trivia.js",
  "js/hgInsights.js",
  "js/dataHub.js",

  "js/domainRegistry.js",
  "js/domainHealthReport.js",

  "js/console/init.js",
  "js/console/verify.js",
  "js/console/diagnosticConsole.js",
  "js/console/devConsole.js",
  "js/console/legacyExtensions.js",

  "js/audits/missingImages.audit.js",

  "js/observations.js",
  "js/observationsView.js",

  "js/core/state.js",
  "js/core/persistence.js",
  "js/core/openmode.js",
  "js/core/core.js",
  "js/core/categories.js",
  "js/core/badges.js",
  "js/core/tiersCivi.js",
  "js/core/geo.js",
  "js/core/pos.js",

  "js/map.js",
  "js/ors-config.js",
  "js/navRoutes.js",

  "js/hg_unlocks.js",
  "js/quizzes.js",
  "js/quiz-audit.js",

  "js/ui/dom.js",
  "js/ui/toast.js",
  "js/ui/events.js",
  "js/ui/interactions.js",
  "js/ui/lists.js",
  "js/ui/left-panel.js",
  "js/ui/badges.js",
  "js/ui/badge-modal.js",
  "js/ui/mini-profile.js",
  "js/ui/civication-inbox.js",

  "js/boot.js",
  "js/app.js"
];

// -------------------- helpers --------------------
function isSameOrigin(url) {
  try {
    return new URL(url, self.location.href).origin === self.location.origin;
  } catch {
    return false;
  }
}

async function cacheAddAllSafe(cache, urls) {
  // addAll feiler hvis én fil 404’er – derfor gjør vi "best effort"
  await Promise.all(urls.map(async (u) => {
    try {
      const req = new Request(u, { cache: "reload" });
      const res = await fetch(req);
      if (res && res.ok) await cache.put(req, res);
    } catch {
      // ignore
    }
  }));
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  const fetchPromise = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);

  return cached || (await fetchPromise) || new Response("", { status: 504 });
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return cached || new Response("", { status: 504 });
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req)) || new Response("", { status: 504 });
  }
}

// -------------------- install / activate --------------------
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_STATIC);
    await cacheAddAllSafe(cache, PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k.startsWith("hg-static-") && k !== CACHE_STATIC) return caches.delete(k);
      if (k.startsWith("hg-runtime-") && k !== CACHE_RUNTIME) return caches.delete(k);
      return Promise.resolve();
    }));
    await self.clients.claim();
  })());
});

// -------------------- fetch routing --------------------
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Kun GET
  if (req.method !== "GET") return;

  // Navigasjon (HTML): network-first, fallback cache
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, CACHE_STATIC));
    return;
  }

  // Same-origin: styr caching per type
  if (url.origin === self.location.origin) {
    const path = url.pathname;

    // Data (JSON) – cache-first (offline-friendly)
    if (path.startsWith("/History-Go/data/") || path.includes("/data/")) {
      event.respondWith(cacheFirst(req, CACHE_RUNTIME));
      return;
    }

    // Bilder – cache-first
    if (path.includes("/bilder/") || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(path)) {
      event.respondWith(cacheFirst(req, CACHE_RUNTIME));
      return;
    }

    // JS/CSS – stale-while-revalidate
    if (/\.(js|css)$/i.test(path)) {
      event.respondWith(staleWhileRevalidate(req, CACHE_STATIC));
      return;
    }

    // Fallback: stale-while-revalidate
    event.respondWith(staleWhileRevalidate(req, CACHE_RUNTIME));
    return;
  }

  // Cross-origin (kart-tiles, cdn): stale-while-revalidate i runtime
  event.respondWith(staleWhileRevalidate(req, CACHE_RUNTIME));
});
