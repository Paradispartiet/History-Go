// --- History Go service worker ---
// BUMP denne ved endringer i app/js/json:
const CACHE = 'hg-v4-2025-09-05';

const ASSETS = [
  './',
  './index.html',
  './app.js',
  './theme.css',
  './places.json',
  './people.json',
  './quizzes.json',
  // CDN-ressurser som er små/nyttige å ha cachet:
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Network-first for JSON/HTML/JS/CSS, med cache fallback.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Bare håndter GET
  if (req.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        const net = await fetch(req);
        // Cache bare same-origin (unngå CORS-trøbbel)
        if (new URL(req.url).origin === self.location.origin) {
          const cache = await caches.open(CACHE);
          cache.put(req, net.clone());
        }
        return net;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;

        // Fallback for navigasjon
        if (req.mode === 'navigate') {
          const cache = await caches.open(CACHE);
          const index = await cache.match('./index.html');
          if (index) return index;
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});
