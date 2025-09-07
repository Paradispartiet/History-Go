// Minimal, stille SW: cache kun same-origin; ignorer tredjepart (tiles, OSRM) → ingen "opaque"-støy
const CACHE = 'hg-v14';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([
    './','./index.html','./theme.css','./app.js'
  ])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Bare cache same-origin GET
  if (url.origin === self.location.origin && e.request.method === 'GET') {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }))
    );
  } else {
    // tredjepart → bare fetch (ikke cache, ikke logg)
    e.respondWith(fetch(e.request));
  }
});
