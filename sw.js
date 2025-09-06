// sw.js — History Go (v11)
const CACHE = 'history-go-v11';

// Filer vi vil ha offline (samme origin)
const ASSETS = [
  './',
  './index.html',
  './theme.css',
  './app.js',
  './manifest.json',
  './places.json',
  './people.json',
  './quizzes.json',
  './badges.json',
  // Ikoner (hvis de finnes hos deg)
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
];

// Install: legg kjente assets i cache
self.addEventListener('install', (evt) => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
});

// Activate: fjern gamle cacher
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch-strategi
// - Navigasjoner: nett først, fallback cache (offline-støtte)
// - Andre GET: "stale-while-revalidate" for ressurser på samme origin
// - Eksterne domener (f.eks. kart-tiles): cache'es ikke her
self.addEventListener('fetch', (evt) => {
  const req = evt.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // HTML / navigasjon
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    evt.respondWith(
      fetch(req).then((res) => {
        // legg en kopi av index.html i cache
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy));
        return res;
      }).catch(async () => {
        const cached = await caches.match('./index.html');
        return cached || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' }});
      })
    );
    return;
  }

  // Andre same-origin GET: SWR
  if (sameOrigin) {
    evt.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(() => null);

      return cached || network || new Response('Offline', { status: 503 });
    })());
    return;
  }

  // Cross-origin (f.eks. Leaflet-tiles): la nettleseren håndtere (ingen SW-cache)
  return;
});
