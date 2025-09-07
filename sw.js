// Minimal, safe SW (v14)
const V = 'hg-v14';
const CORE = [
  '/', 'index.html', 'theme.css', 'app.js', 'icons.js',
  'places.json', 'people.json', 'quizzes.json'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===V?null:caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // Only same-origin; let cross-origin (tiles, OSRM, Google) pass-through
  if (url.origin === location.origin){
    e.respondWith(
      caches.match(e.request).then(res=> res || fetch(e.request).then(r=>{
        const copy = r.clone();
        caches.open(V).then(c=>c.put(e.request, copy));
        return r;
      }))
    );
  }
  // else: do nothing → network handles it (prevents opaque spam).
});
