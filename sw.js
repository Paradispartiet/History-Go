// =====================================================
// SERVICE WORKER – HISTORY GO v19 (ren og stabil versjon)
// For GitHub Pages og lokal testing
// =====================================================

const VERSION = 'hg-v10.0.0.0.0.4';
const CORE_FILES = [
  'index.html',
  'profile.html',
  'theme.css',
  'app.js',
  'profile.js',
  'places.json',
  'people.json',
  'quiz_historie.json',
  'quiz_vitenskap.json',
  'quiz_kunst.json',
  'quiz_musikk.json',
  'quiz_natur.json',
  'quiz_sport.json',
  'quiz_politikk.json',
  'quiz_litteratur.json',
  'quiz_populaerkultur.json',
  'quiz_subkultur.json'
];

// ------------------------------------------------------------
// INSTALL – legg alle filer i cache
// ------------------------------------------------------------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Install error:', err))
  );
});

// ------------------------------------------------------------
// ACTIVATE – fjern gamle versjoner
// ------------------------------------------------------------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key === VERSION ? null : caches.delete(key))
      )
    )
  );
  self.clients.claim();
  console.log('[SW] Aktivert:', VERSION);
});

// ------------------------------------------------------------
// FETCH – HTML = network-first, static = cache-first
// ------------------------------------------------------------
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // HTML → network-first
  if (req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Samme opprinnelse → cache-first
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(cacheRes =>
        cacheRes ||
        fetch(req).then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(cache => cache.put(req, copy));
          return res;
        })
      )
    );
  }

  // Alt annet (f.eks. kartfliser, API) → network-only
});
