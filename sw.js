// sw.js — History Go (stale-while-revalidate)

// ❗ Bytt versjon når du endrer ASSETS (v4, v5, ...)
const CACHE = "history-go-v4";

const ASSETS = [
  "./",
  "./index.html",
  "./theme.css",
  "./app.js",
  "./places.json",
  "./people.json",     // valgfri — ok om mangler
  "./manifest.json"
];

// Installer: legg alt i cache
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

// Aktiver: fjern gammel cache
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Hent: stale-while-revalidate
self.addEventListener("fetch", (e) => {
  const req = e.request;

  // Bare GET bør caches
  if (req.method !== "GET") return;

  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((netRes) => {
          // Bare cache suksessfulle, samme-origin svar
          if (netRes && netRes.status === 200 && netRes.type === "basic") {
            const copy = netRes.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return netRes;
        })
        .catch(() => cached); // offline fallback til cache hvis finnes

      // Returner cache først (raskt), oppdater i bakgrunnen
      return cached || fetchPromise;
    })
  );
});
