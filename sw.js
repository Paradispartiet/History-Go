const CACHE = "history-go-v2"; // <- bump versjon når du endrer noe
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./places.json",
  "./people.json",   // lagt til
  "./theme.css",     // lagt til
  "./manifest.json",
  "./sw.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});
