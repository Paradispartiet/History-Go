// sw.js — History Go v11
const CACHE = 'history-go-v11';

// App-shell som bør være tilgjengelig offline
const APP_ASSETS = [
  './',
  './index.html',
  './theme.css',
  './app.js',
  './manifest.json',
  // data kan ligge i /data eller rot – vi lar fetch-strategien håndtere JSON
  // Ikoner (hvis du har dem)
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  // Leaflet CSS/JS er fra CDN – vi lar nettverket hente disse
];

// Hjelpere
const isMapTile = (url) =>
  /(?:cartocdn\.com|tile\.openstreetmap\.org|googleapis\.com\/maps|tiles\.stadiamaps\.com)/i.test(url);

const isJSON = (url) => /\.json(\?|$)/i.test(url);

// Install: legg inn app-shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_ASSETS))
  );
});

// Activate: rydd gamle cacher
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch-strategier:
// - Kartfliser: gå rett på nett (ikke cache)
// - JSON: network-first (med cache-fallback)
// - Annet GET: cache-first (med nett-oppdatering i bakgrunnen)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;

  // Ikke håndter tredjeparts POST/PUT osv, bare GET allerede filtrert
  // Bypass: kartfliser
  if (isMapTile(url)) {
    return; // la nettleseren håndtere (ingen respondWith)
  }

  // JSON: network-first
  if (isJSON(url)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Alt annet: cache-first
  event.respondWith(cacheFirst(req));
});

// Meldings-hook for manuell oppgradering (fra appen: reg.waiting.postMessage({type:'SKIP_WAITING'}))
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// --- Strategier ---
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) {
    // Forsøk å oppdatere i bakgrunnen
    fetch(request).then((res) => {
      if (res && res.ok && res.type === 'basic') {
        cache.put(request, res.clone());
      }
    }).catch(() => {});
    return cached;
  }
  // Hvis ikke i cache: hent fra nett og legg i cache (hvis same-origin)
  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === 'basic') {
      cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    // Siste utvei: om index.html ligger i cachen, returner den
    const fallback = await cache.match('./index.html');
    return fallback || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request, { cache: 'no-store' });
    if (res && res.ok) {
      cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fallback: tom JSON for å unngå hard crash i appen
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  }
}
