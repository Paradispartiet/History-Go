// =====================================================
// SERVICE WORKER – HISTORY GO v17.4 (stabil versjon)
// For GitHub Pages og lokal testing
// =====================================================

const V = 'hg-v18.2.1.1.072';
const CORE = [
  'index.html',
  'profile.html',
  'theme.css',
  'app.js',
  'profile.js',
  'icons.js',
  'places.json',
  'people.json',
  'popup-utils.js',
  'quiz_vitenskap.json',
  'quiz_litteratur.json',
  'quiz_historie.json',
  'quiz_naeringsliv.json',
  'quiz_kunst.json',
  'quiz_musikk.json',
  'quiz_sport.json',
  'quiz_politikk.json',
  'quiz_natur.json',
  'quiz_populaerkultur.json',
  'quiz_subkultur.json'
];

// ------------------------------------------------------------
// INSTALL – legg alt i cache
// ------------------------------------------------------------
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V)
      .then(c => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

// ------------------------------------------------------------
// ACTIVATE – slett gamle versjoner
// ------------------------------------------------------------
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === V ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// ------------------------------------------------------------
// FETCH – HTML = network-first, static = cache-first
// ------------------------------------------------------------
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // HTML → network-first for å hente nye builds
  if (e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const copy = r.clone();
          caches.open(V).then(c => c.put(e.request, copy));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Same-origin statiske filer → cache-first
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(res =>
        res ||
        fetch(e.request).then(r => {
          const copy = r.clone();
          caches.open(V).then(c => c.put(e.request, copy));
          return r;
        })
      )
    );
  }

  // Cross-origin (kartfliser, OSRM, Wikipedia) → network-only
});
