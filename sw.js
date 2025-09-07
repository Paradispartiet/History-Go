// sw.js — History Go (minimal, v13)
const VERSION = 'v13.0.0';
const CACHE = `hg-${VERSION}`;

const CORE = [
  './',
  './index.html',
  './theme.css',
  './app.js',
  './places.json',
  './people.json',
  './quizzes.json',
  './manifest.json'
];

// Installer: legg alt i cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE))
  );
});

// Aktiver: rydd gamle caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => (n !== CACHE ? caches.delete(n) : Promise.resolve())));
    await self.clients.claim();
  })());
});

// Enkle strategier:
// - Navigasjon (HTML): network-first (fallback cache)
// - Same-origin CSS/JS/JSON: cache-first (oppdater i bakgrunnen)
// - Kartfliser & CDN (Leaflet/tiles): cache-first
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML = req.mode === 'navigate' || (req.destination === 'document');
  const isSameOrigin = url.origin === self.location.origin;

  // Kartfliser / CDN (Leaflet/tiles)
  const isTileOrCDN =
    url.hostname.includes('cartocdn.com') ||
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('unpkg.com');

  if (isHTML) {
    // Network-first for å få siste versjon av siden
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, net.clone());
        return net;
      } catch {
        const match = await caches.match(req);
        return match || caches.match('./index.html');
      }
    })());
    return;
  }

  if (isTileOrCDN || (isSameOrigin && ['style', 'script', 'worker', 'image', 'font'].includes(req.destination))) {
    // Cache-first
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) {
        // Oppdater i bakgrunnen (best effort)
        event.waitUntil((async () => {
          try {
            const net = await fetch(req, { cache: 'no-store' });
            const cache = await caches.open(CACHE);
            await cache.put(req, net.clone());
          } catch {}
        })());
        return cached;
      }
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, net.clone());
        return net;
      } catch {
        return new Response('', { status: 504, statusText: 'Offline' });
      }
    })());
    return;
  }

  // Same-origin JSON/API → cache-first (enkel)
  if (isSameOrigin && req.destination === '' /* fetch() / JSON */) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const net = await fetch(req);
      const cache = await caches.open(CACHE);
      cache.put(req, net.clone());
      return net;
    })());
    return;
  }

  // Fallback: bare hent
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
