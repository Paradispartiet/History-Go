// sw.js – History Go (anbefalt)
const VERSION = 'v14.0';
const CACHE_NAME = `historygo-${VERSION}`;

// Precache kun egne, kritiske assets (ikke kartfliser el. CDN)
const ASSETS = [
  '/',                 // bare hvis appen serveres på rot; fjern hvis GitHub Pages med subpath
  '/index.html',
  '/theme.css',
  '/app.js',
  '/manifest.json',
  '/places.json',
  '/people.json',
  '/quizzes.json',
  // Ikoner (tilpass navn/sti til repoet ditt)
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Hjelpere
const isOwnOrigin = (url) => url.origin === self.location.origin;
const isDataJSON  = (url) => isOwnOrigin(url) && /\/(places|people|quizzes)\.json$/.test(url.pathname);
const isStaticOwn = (url) => isOwnOrigin(url) && !isDataJSON(url);
const isMapTile   = (url) => /(\.tile|cartocdn|tile\.openstreetmap|maps\.)/i.test(url.host);

// Installer: precache + aktiver raskt
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(()=>{}))
  );
});

// Aktiver: rydde gamle og ta kontroll
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

// Strategier:
// 1) JSON data: Network-first, fallback til cache
// 2) Egne statiske: Cache-first, fallback til nett
// 3) Kartfliser/CDN: direkte nett (ikke cache), bare pass-through
// 4) Navigasjon/offline: fallback til index.html
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Kun GET requests håndteres
  if (req.method !== 'GET') return;

  // Ikke håndter tracking/beacon
  if (req.mode === 'navigate') {
    // Navigasjon: prøv nett først, fallback til cache/index
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // Ikke cache kartfliser / andre domener
  if (!isOwnOrigin(url) || isMapTile(url)) {
    // Pass-through uten caching (kan evt. byttes til stale-while-revalidate om ønskelig)
    return; // la nettleseren fetch’e normalt
  }

  // Data JSON → network-first
  if (isDataJSON(url)) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        const copy = net.clone();
        const c = await caches.open(CACHE_NAME);
        c.put(req, copy);
        return net;
      } catch {
        const hit = await caches.match(req);
        if (hit) return hit;
        // siste utvei: tom respons med 503
        return new Response(JSON.stringify([]), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    })());
    return;
  }

  // Egne statiske → cache-first
  if (isStaticOwn(url)) {
    event.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const net = await fetch(req);
        const copy = net.clone();
        const c = await caches.open(CACHE_NAME);
        c.put(req, copy);
        return net;
      } catch {
        // fallback: hvis CSS/JS feiler, prøv index
        if (req.destination === 'document') {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match('/index.html')) || Response.error();
        }
        return Response.error();
      }
    })());
  }
});

// Valgfritt: motta “skipWaiting” fra appen for å hoppe til ny SW uten reload-dans
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
