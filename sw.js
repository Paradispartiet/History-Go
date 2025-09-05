// sw.js — History Go (PWA)
// ————————————————————————————————
const APP_CACHE   = 'hg-app-v5';
const TILE_CACHE  = 'hg-tiles-v1';
const RUNTIME     = 'hg-runtime-v1';

// Precache disse filene ved install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './theme.css',
  './app.js',
  './places.json',
  './people.json',
  './manifest.json',
  // PWA-ikoner (tilpass stier om nødvendig)
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png'
];

// Hjelper: sjekk om en URL er en kart-tile vi vil cache separat
function isTileRequest(req) {
  const u = new URL(req.url);
  // CARTO / OSM / Stamen o.l. (utvid ved behov)
  return /basemaps\.cartocdn\.com|tile\.openstreetmap\.org|stamen\.com/i.test(u.host);
}

// Enkelt "trim cache" for tiles (behold maks N)
async function trimCache(cacheName, maxItems = 200) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const deleteCount = keys.length - maxItems;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// INSTALL — precache
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    self.skipWaiting();
    const cache = await caches.open(APP_CACHE);
    await cache.addAll(PRECACHE_ASSETS);
  })());
});

// ACTIVATE — rydde gamle cacher + navigation preload
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Rydd bort alt som ikke er i bruk
    const keep = new Set([APP_CACHE, TILE_CACHE, RUNTIME]);
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (keep.has(k) ? null : caches.delete(k))));
    // Navigation preload
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    await self.clients.claim();
  })());
});

// FETCH — SWR for det meste, egen håndtering for tiles
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Bare GET
  if (req.method !== 'GET') return;

  // Kart-tiles i egen cache (cache first + trim)
  if (isTileRequest(req)) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req, { mode: 'cors' });
        if (res.ok) {
          cache.put(req, res.clone());
          trimCache(TILE_CACHE, 400); // øk/reduser etter behov
        }
        return res;
      } catch (e) {
        return hit || Response.error();
      }
    })());
    return;
  }

  // App- og øvrige forespørsler: stale-while-revalidate
  event.respondWith((async () => {
    const cached = await caches.match(req);
    const fetchPromise = fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          // Legg i runtime-cache (ikke overstyr app-cache)
          caches.open(RUNTIME).then((c) => c.put(req, res.clone()));
        }
        return res;
      })
      .catch(() => cached);
    return cached || fetchPromise;
  })());
});

// OPTIONAL: Network fallback for navigasjoner (kan vise cached index)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Navigation preload hvis tilgjengelig (raskere first paint)
        const preload = await event.preloadResponse;
        if (preload) return preload;
        return await fetch(event.request);
      } catch {
        // Fallback til precachet index
        const cache = await caches.open(APP_CACHE);
        const hit = await cache.match('./index.html');
        return hit || Response.error();
      }
    })());
  }
});
