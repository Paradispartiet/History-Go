// sw.js — History Go (v4)
const CACHE = "history-go-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./theme.css",
  "./app.js",
  "./places.json",
  "./people.json",
  "./quizzes.json",
  "./manifest.json"
];

self.addEventListener("install",(e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener("activate",(e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});
self.addEventListener("fetch",(e)=>{
  const req=e.request;
  if(req.method!=="GET") return;
  e.respondWith(
    caches.match(req).then(cached=>{
      const fetched=fetch(req).then(res=>{
        if(res && res.status===200 && res.type==="basic"){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return res;
      }).catch(()=>cached);
      return cached || fetched;
    })
  );
});
