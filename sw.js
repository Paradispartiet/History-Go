// sw v14 – liten, trygg cache
const CACHE = 'hg-v15';
const ASSETS = [
  './',
  './index.html',
  './theme.css',
  './app.js',
  './places.json',
  './people.json',
  './quizzes.json',
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(r => r || fetch(request).then(resp=>{
      // json og html hentes alltid fra nett (men ikke-crit legges i cache for neste gang)
      const clone = resp.clone();
      if (!request.url.endsWith('.json') && !request.headers.get('accept')?.includes('text/html')) {
        caches.open(CACHE).then(c=>c.put(request, clone)).catch(()=>{});
      }
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});
