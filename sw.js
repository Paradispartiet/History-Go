// sw.js — History Go (v11)
const CACHE = 'hg-v11';
const APP_SHELL = [
  './',
  './index.html',
  './theme.css',
  './app.js',
  './manifest.json',
  './places.json',
  './people.json',
  './quizzes.json'
];

// Install: legg i cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
});

// Activate: rydd gamle cacher
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Hjelpere
const isSameOrigin = (url) => new URL(url, self.location.href).origin === self.location.origin;
const isJSON = (url) => url.endsWith('.json');

// Fetch-strategi:
// - Navigasjoner (SPA): fallback til index.html fra cache
// - JSON: network-first (cache fallback)
// - Annet GET (samme origin): stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navigasjoner (SPA)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Kun samme origin caches
  if (!isSameOrigin(url)) return;

  // JSON → network-first
  if (isJSON(url.pathname)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Statiske filer → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

// Strategier
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (_) {
    const cached = await cache.match(req);
    if (cached) return cached;
    // ekstra fallback for datafeil
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || network || fetch(req);
}

// Valgfritt: oppgrader umiddelbart når klient ber om det
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
