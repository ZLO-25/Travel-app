/* Ryan Travel App service worker — cache shell for offline */
const CACHE = 'ryan-travel-v3';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/auth.js',
  './js/seed.js',
  './js/storage.js',
  './js/sync.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/icon.svg'
];

function isRemoteJson(url) {
  try {
    const u = new URL(url);
    return u.pathname.endsWith('/data/remote.json') || u.pathname.endsWith('data/remote.json');
  } catch (e) {
    return String(url).indexOf('data/remote.json') !== -1;
  }
}

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

  // Always network-first for sync payload; never keep a forever-stale remote.json
  if (isRemoteJson(req.url)) {
    event.respondWith(
      fetch(req).then(function (res) {
        return res;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      const fetched = fetch(req).then(function (res) {
        if (res && res.ok && (req.url.startsWith(self.location.origin)) && !isRemoteJson(req.url)) {
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
