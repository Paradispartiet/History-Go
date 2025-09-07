// History Go – enkel, “stille” SW som ikke spammer konsollen
const CACHE = 'hg-v1';
const CORE = [
  '/', '/index.html', '/theme.css', '/app.js',
  '/places.json', '/people.json', '/quizzes.json'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);

  // Ikke cache eksterne kart-tiles og routing (hindrer "opaque" spam)
  if (url.hostname.includes('cartocdn.com') || url.hostname.includes('project-osrm.org')) {
    return; // la nettverket håndtere
  }

  // Same-origin: cache-first med nettverksfallback
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).then(net => {
        const clone = net.clone();
        caches.open(CACHE).then(c=>c.put(e.request, clone));
        return net;
      }).catch(()=>res);
    })
  );
});
