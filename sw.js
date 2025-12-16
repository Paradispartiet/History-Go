/* ============================================================
   HISTORY GO – SERVICE WORKER (FULL) – AFTER FOLDER REFACTOR
   - /js/*, /css/*, /data/*
   - Robust precache: skipper filer som mangler (ingen "alt dør")
============================================================ */

const CACHE_VERSION = "HG-FULL-v3.0.4.1.022"; // <- bump når du endrer paths
const STATIC_CACHE  = `historygo-${CACHE_VERSION}`;

/* ------------------------------------------------------------
   FILER SOM SKAL CACHES (HTML + CSS + JS + JSON + UI)
   NB: bruk ABSOLUTTE paths (leading "/") for stabilitet
------------------------------------------------------------ */

const STATIC_ASSETS = [
  // Rot-HTML
  "/index.html",
  "/profile.html",
  "/knowledge.html",
  "/merker.html",
  "/notater.html",
  "/emner.html",

  // CSS
  "/css/theme.css",
  "/css/profile.css",
  "/css/knowledge.css",
  "/merker/merker.css",

  // JS
  "/js/app.js",
  "/js/map.js",
  "/js/routes.js",
  "/js/quizzes.js",
  "/js/popup-utils.js",
  "/js/profile.js",
  "/js/trivia.js",
  "/js/knowledge.js",
  "/js/knowledge_component.js",

  // (valgfritt – ta med hvis de finnes og brukes)
  "/js/dataHub.js",
  "/js/emnerLoader.js",
  "/js/fagkartLoader.js",
  "/js/hgInsights.js",
  "/js/hgConceptIndex.js",
  "/js/emneDekning.js",

  // JSON data
  "/data/badges.json",
  "/data/people.json",
  "/data/places.json",
  "/data/routes.json",
  "/data/tags.json",

  // (valgfritt – hvis de faktisk finnes hos deg)
  "/data/people_litteratur.json",
  "/data/people_vitenskap.json",
  "/data/places2.json",

  // Quiz JSON (mappa di heter "quiz")
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

  // Knowledge-sider
  "/knowledge/knowledge_by.html",
  "/knowledge/knowledge_historie.html",
  "/knowledge/knowledge_kunst.html",
  "/knowledge/knowledge_litteratur.html",
  "/knowledge/knowledge_musikk.html",
  "/knowledge/knowledge_naeringsliv.html",
  "/knowledge/knowledge_natur.html",
  "/knowledge/knowledge_politikk.html",
  "/knowledge/knowledge_populaerkultur.html",
  "/knowledge/knowledge_sport.html",
  "/knowledge/knowledge_subkultur.html",
  "/knowledge/knowledge_vitenskap.html",

  // Merke-sider
  "/merker/merke_by.html",
  "/merker/merke_historie.html",
  "/merker/merke_kunst.html",
  "/merker/merke_litteratur.html",
  "/merker/merke_musikk.html",
  "/merker/merke_naeringsliv.html",
  "/merker/merke_natur.html",
  "/merker/merke_politikk.html",
  "/merker/merke_populaerkultur.html",
  "/merker/merke_sport.html",
  "/merker/merke_subkultur.html",
  "/merker/merke_vitenskap.html",

  // UI-bilder
  "/bilder/ui/historygo_logo.PNG",
  "/bilder/ui/marker.PNG",
  "/bilder/ui/badge_default.PNG"
];

/* ------------------------------------------------------------
   INSTALL – precache (robust)
------------------------------------------------------------ */
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);

    // cache hver fil separat, så en 404 ikke ødelegger install
    await Promise.all(
      STATIC_ASSETS.map(async (url) => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res || !res.ok) return;
          await cache.put(url, res.clone());
        } catch {
          // ignorer nettfeil / manglende fil
        }
      })
    );

    await self.skipWaiting();
  })());
});

/* ------------------------------------------------------------
   ACTIVATE – fjern gammel cache
------------------------------------------------------------ */
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k.startsWith("historygo-") && k !== STATIC_CACHE)
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/* ------------------------------------------------------------
   FETCH – SMART STRATEGI
   - JS/JSON: Network-first (cache fallback)
   - HTML/CSS/Images: Cache-first (network fallback)
------------------------------------------------------------ */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Bare håndter samme origin (unngå tredjeparts CDN-problemer)
  if (url.origin !== self.location.origin) return;

  // 1) JS + JSON → NETWORK FIRST
  if (url.pathname.endsWith(".js") ||
