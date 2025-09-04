// sw.js — History Go (v4)
const CACHE = "history-go-v7";

const ASSETS = [
  "./",
  "./index.html",

  // Versjonerte filer (matcher index.html referanser)
  "./theme.css?v=4",
  "./app.js?v=4",

  // Uversjonerte (fallback hvis noen laster uten query)
  "./theme.css",
  "./app.js",

  // Data / manifest
  "./places.json",
  "./people.json",
  "./manifest.json",

  // PWA-ikoner (juster hvis du har andre stier/navn)
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Stale-while-revalidate
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // Bare cache same-origin
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    // Pass-through for tredjepart (Leaflet-CDN osv.)
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => {
        // Oppdater cache for "basic
