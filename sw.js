// History Go – sw.js (ny)
const CACHE_VERSION = 'historygo-v9'; // bump når du shipper
const CORE = [
  './',
  './index.html',
  './theme.css',
  './app.js',
  './places.json',
  './people.json',
  './quizzes.json',
  './badges.json',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(CORE).catch(()=>{}))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_VERSION) ? caches.delete(k) : null));
    await self.clients.claim();
    console.log('[SW] Active:', CACHE_VERSION);
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // alltid nett først for JSON/JS/CSS (for å slippe utdaterte data)
  if (/\.(json|js|css)$/.test(url.pathname)) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(e.request, { cache: 'no-store' });
        const cache = await caches.open(CACHE_VERSION);
        cache.put(e.request, fresh.clone()).catch(()=>{});
        return fresh;
      } catch {
        const cached = await caches.match(e.request);
        return cached || Response.error();
      }
    })());
    return;
  }
  // default: cache-first fallback
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) return cached;
    try {
      const fresh = await fetch(e.request);
      const cache = await caches.open(CACHE_VERSION);
      cache.put(e.request, fresh.clone()).catch(()=>{});
      return fresh;
    } catch {
      return Response.error();
    }
  })());
});
