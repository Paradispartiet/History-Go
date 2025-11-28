/* ============================================================
   HISTORY GO – FULL SERVICE WORKER (2025)
   Støtter hele prosjektstrukturen din
   - HTML/CSS/bilder cached
   - JS/JSON alltid ferskt
   - Null cache-låsing
============================================================ */

const CACHE_VERSION = "HG-FULL-v3.0.3.1.001";
const STATIC_CACHE = `historygo-${CACHE_VERSION}`;

// ------------------------------------------------------------
// FILER SOM SKAL CACHES (HTML + CSS + BILDER + UI)
// ------------------------------------------------------------
const STATIC_ASSETS = [

  // Rotfiler
  "index.html",
  "profile.html",
  "knowledge.html",
  "merker.html",
  "theme.css",
  "profile.css",
  "knowledge.css",
  "merker/merker.css",

  // Knowledge-sider (11 stk)
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

  // Merke-sider (12 stk)
  "merker/merke_by.html",
  "merker/merke_historie.html",
  "merkers/merke_kunst.html",
  "merker/merke_litteratur.html",
  "merker/merke_musikk.html",
  "merker/merke_naeringsliv.html",
  "merker/merke_natur.html",
  "merker/merke_politikk.html",
  "merker/merke_populaerkultur.html",
  "merker/merke_sport.html",
  "merker/merke_subkultur.html",
  "merker/merke_vitenskap.html",

  // Bilder + UI
  "bilder/ui/historygo_logo.PNG",
  "bilder/ui/marker.PNG",
  "bilder/ui/badge_default.PNG",

  // (Du kan legge inn flere bilder her senere)
];

// ------------------------------------------------------------
// INSTALL
// ------------------------------------------------------------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ------------------------------------------------------------
// ACTIVATE – fjern gammel cache
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// FETCH – SMART STRATEGI
// ------------------------------------------------------------
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) JS + JSON → ALLTID FERSKT
  if (
    req.url.endsWith(".js") ||
    req.url.endsWith(".json")
  ) {
    return event.respondWith(fetch(req).catch(() => caches.match(req)));
  }

  // 2) HTML/CSS → CACHE FIRST + FALLBACK
  if (
    req.url.endsWith(".html") ||
    req.url.endsWith(".css")
  ) {
    return event.respondWith(
      caches.match(req).then(cacheRes => {
        return (
          cacheRes ||
          fetch(req).then(netRes => {
            const copy = netRes.clone();
            caches.open(STATIC_CACHE).then(c => c.put(req, copy));
            return netRes;
          })
        );
      })
    );
  }

  // 3) Bilder → CACHE FIRST
  if (req.url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
    return event.respondWith(
      caches.match(req).then(cacheRes => {
        return (
          cacheRes ||
          fetch(req).then(netRes => {
            const copy = netRes.clone();
            caches.open(STATIC_CACHE).then(c => c.put(req, copy));
            return netRes;
          })
        );
      })
    );
  }

  // 4) Alt annet → network first
  return event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
