// ============================================================
// === HISTORY GO – SERVICE WORKER (stabil basis) =============
// ============================================================

const CACHE_NAME = "historygo-v1";

// Filer som alltid skal ligge i cache
const CORE_ASSETS = [
  "/index.html",
  "/profile.html",
  "/css/theme.css",
  "/js/core.js",
  "/js/app.js",
  "/js/map.js",
  "/js/ui.js",
  "/js/quiz.js",
  "/js/data.js",
  "/js/routes.js",
  "/js/profile.js",
  "/bilder/logo_historygo.PNG",
  // legg til flere bilder etter behov
];

// ------------------------------------------------------------
// INSTALL – legg filer i cache
// ------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// ------------------------------------------------------------
// ACTIVATE – fjern gammel cache
// ------------------------------------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// ------------------------------------------------------------
// FETCH – prøv cache først, deretter nett
// ------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const req = event.request;
  // bare GET-forespørsler caches
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          // legg nye filer i cache
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return resp;
        })
        .catch(() => cached || new Response("Offline", { status: 503 }));
    })
  );
});
