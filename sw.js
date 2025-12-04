/* ============================================================
   HISTORY GO – SERVICE WORKER (FULL)
   Versjon: HG-FULL-v3.0.3.1.002
============================================================ */

const CACHE_VERSION = "HG-FULL-v3.0.3.1.010";
const STATIC_CACHE = `historygo-${CACHE_VERSION}`;

/* ------------------------------------------------------------
   FILER SOM SKAL CACHES (HTML + CSS + JS + JSON + UI)
------------------------------------------------------------ */

const STATIC_ASSETS = [

  // Rot-HTML
  "index.html",
  "profile.html",
  "knowledge.html",
  "merker.html",

  // CSS
  "theme.css",
  "profile.css",
  "knowledge.css",
  "merker/merker.css",

  // JS (rot)
  "app.js",
  "popup-utils.js",
  "knowledge.js",
  "knowledge_component.js",
  "profile.js",
  "trivia.js",
  "quizzes.js",
  "routes.js",

  // JSON data
  "badges.json",
  "people.json",
  "people_litteratur.json",
  "people_vitenskap.json",
  "places.json",
  "places2.json",
  "routes.json",

  // Quiz JSON
  "quiz_by.json",
  "quiz_historie.json",
  "quiz_kunst.json",
  "quiz_litteratur.json",
  "quiz_musikk.json",
  "quiz_naeringsliv.json",
  "quiz_natur.json",
  "quiz_politikk.json",
  "quiz_populaerkultur.json",
  "quiz_sport.json",
  "quiz_subkultur.json",
  "quiz_vitenskap.json",

  // Knowledge-sider
  "knowledge/knowledge_by.html",
  "knowledge/knowledge_historie.html",
  "knowledge/knowledge_kunst.html",
  "knowledge/knowledge_litteratur.html",
  "knowledge/knowledge_musikk.html",
  "knowledge/knowledge_naeringsliv.html",
  "knowledge/knowledge_natur.html",
  "knowledge/knowledge_politikk.html",
  "knowledge/knowledge_populaerkultur.html",
  "knowledge/knowledge_sport.html",
  "knowledge/knowledge_subkultur.html",
  "knowledge/knowledge_vitenskap.html",

  // Merke-sider
  "merker/merke_by.html",
  "merker/merke_historie.html",
  "merker/merke_kunst.html",
  "merker/merke_litteratur.html",
  "merker/merke_musikk.html",
  "merker/merke_naeringsliv.html",
  "merker/merke_natur.html",
  "merker/merke_politikk.html",
  "merker/merke_populaerkultur.html",
  "merker/merke_sport.html",
  "merker/merke_subkultur.html",
  "merker/merke_vitenskap.html",

  // UI-bilder
  "bilder/ui/historygo_logo.PNG",
  "bilder/ui/marker.PNG",
  "bilder/ui/badge_default.PNG"
];

/* ------------------------------------------------------------
   INSTALL
------------------------------------------------------------ */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ------------------------------------------------------------
   ACTIVATE – fjern gammel cache
------------------------------------------------------------ */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith("historygo-") && k !== STATIC_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ------------------------------------------------------------
   FETCH – SMART STRATEGI
------------------------------------------------------------ */
self.addEventListener("fetch", event => {
  const req = event.request;

  // 🎯 1) JS + JSON → NETWORK FIRST (cache fallback)
  if (req.url.endsWith(".js") || req.url.endsWith(".json")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 🎯 2) HTML + CSS → CACHE FIRST (deretter nett)
  if (req.url.endsWith(".html") || req.url.endsWith(".css")) {
    event.respondWith(
      caches.match(req).then(cacheRes => {
        if (cacheRes) return cacheRes;
        return fetch(req).then(netRes => {
          const copy = netRes.clone();
          caches.open(STATIC_CACHE).then(c => c.put(req, copy));
          return netRes;
        });
      })
    );
    return;
  }

  // 🎯 3) Bilder → CACHE FIRST
  if (req.url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
    event.respondWith(
      caches.match(req).then(cacheRes => {
        if (cacheRes) return cacheRes;
        return fetch(req).then(netRes => {
          const copy = netRes.clone();
          caches.open(STATIC_CACHE).then(c => c.put(req, copy));
          return netRes;
        });
      })
    );
    return;
  }

  // 🎯 4) Alt annet – fallback-strategi
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
