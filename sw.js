/* Ryan Travel App service worker — cache shell for offline */
const CACHE = 'ryan-travel-v2';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/auth.js',
  './js/seed.js',
  './js/storage.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/icon.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(function (cached) {
      const fetched = fetch(req).then(function (res) {
        if (res && res.ok && (req.url.startsWith(self.location.origin))) {
          const copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return cached || caches.match('./index.html');
      });
      return cached || fetched;
    })
  );
});
