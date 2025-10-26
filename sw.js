// SW v16 – stabil versjon for GitHub Pages og lokal testing
const V = 'hg-v17.1.4';
const CORE = [
  'index.html',
  'theme.css',
  'app.js',
  'icons.js',
  'places.json',
  'people.json',
  'quiz_historie.json',
  'quiz_kunst.json',
  'quiz_sport.json',
  'quiz_politikk.json',
  'quiz_populaerkultur.json'
];

// ------------------------------------------------------------
// INSTALL
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
// FETCH – strategi: HTML = network-first, static = cache-first
// ------------------------------------------------------------
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // HTML → network-first (for å hente nye builds)
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

  // Same-origin static → cache-first
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(
        res =>
          res ||
          fetch(e.request).then(r => {
            const copy = r.clone();
            caches.open(V).then(c => c.put(e.request, copy));
            return r;
          })
      )
    );
  }

  // cross-origin (tiles, OSRM, Google) → network only
});
