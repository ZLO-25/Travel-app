/* Ryan Travel App service worker — cache shell for offline */
const CACHE = 'ryan-travel-v23';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/auth.js',
  './js/seed.js',
  './js/storage.js',
  './js/photos.js',
  './js/sync.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/icon.svg',
  './assets/details/dermatix-ultra-7g.webp',
  './assets/details/contractubex-10g.webp',
  './assets/details/vibram-kso-evo.webp',
  './assets/details/id-badge-vertical-red-stitch.webp',
  './assets/details/id-badge-horizontal-red-bar.webp',
  './assets/details/id-badge-bifold-minimal.webp',
  './assets/details/thumbs/dermatix-ultra-7g.webp',
  './assets/details/thumbs/contractubex-10g.webp',
  './assets/details/thumbs/vibram-kso-evo.webp',
  './assets/details/thumbs/id-badge-vertical-red-stitch.webp',
  './assets/details/thumbs/id-badge-horizontal-red-bar.webp',
  './assets/details/thumbs/id-badge-bifold-minimal.webp',
  './assets/details/id-badge-d-black-red-topbar.webp',
  './assets/details/id-badge-e-black-red-edgepaint.webp',
  './assets/details/id-badge-f-black-horizontal-red-stitch.webp',
  './assets/details/id-badge-g-black-bifold-red-lining.webp',
  './assets/details/id-badge-h-black-side-red-stripe.webp',
  './assets/details/thumbs/id-badge-d-black-red-topbar.webp',
  './assets/details/thumbs/id-badge-e-black-red-edgepaint.webp',
  './assets/details/thumbs/id-badge-f-black-horizontal-red-stitch.webp',
  './assets/details/thumbs/id-badge-g-black-bifold-red-lining.webp',
  './assets/details/thumbs/id-badge-h-black-side-red-stripe.webp',
  './assets/details/loafer-penny-brown-side.webp',
  './assets/details/loafer-penny-brown-top.webp',
  './assets/details/loafer-penny-brown-threequarter.webp',
  './assets/details/loafer-rubber-sole.webp',
  './assets/details/loafer-penny-strap-detail.webp',
  './assets/details/loafer-casual-jeans.webp',
  './assets/details/loafer-casual-chinos.webp',
  './assets/details/loafer-casual-shorts.webp',
  './assets/details/thumbs/loafer-penny-brown-side.webp',
  './assets/details/thumbs/loafer-penny-brown-top.webp',
  './assets/details/thumbs/loafer-penny-brown-threequarter.webp',
  './assets/details/thumbs/loafer-rubber-sole.webp',
  './assets/details/thumbs/loafer-penny-strap-detail.webp',
  './assets/details/thumbs/loafer-casual-jeans.webp',
  './assets/details/thumbs/loafer-casual-chinos.webp',
  './assets/details/thumbs/loafer-casual-shorts.webp',
  './assets/details/loafer-thin-sole-closeup.webp',
  './assets/details/loafer-thin-sole-edge.webp',
  './assets/details/loafer-thin-sole-profile.webp',
  './assets/details/loafer-modern-sleek-brown.webp',
  './assets/details/loafer-modern-soft-casual.webp',
  './assets/details/loafer-casual-young-jeans.webp',
  './assets/details/loafer-casual-young-linen.webp',
  './assets/details/loafer-casual-young-shorts.webp',
  './assets/details/thumbs/loafer-thin-sole-closeup.webp',
  './assets/details/thumbs/loafer-thin-sole-edge.webp',
  './assets/details/thumbs/loafer-thin-sole-profile.webp',
  './assets/details/thumbs/loafer-modern-sleek-brown.webp',
  './assets/details/thumbs/loafer-modern-soft-casual.webp',
  './assets/details/thumbs/loafer-casual-young-jeans.webp',
  './assets/details/thumbs/loafer-casual-young-linen.webp',
  './assets/details/thumbs/loafer-casual-young-shorts.webp',
];

function isRemoteJson(url) {
  try {
    const u = new URL(url);
    return u.pathname.endsWith('/data/remote.json') || u.pathname.endsWith('data/remote.json');
  } catch (e) {
    return String(url).indexOf('data/remote.json') !== -1;
  }
}

function isShellDoc(url) {
  try {
    const u = new URL(url);
    const path = u.pathname;
    return path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('index.html');
  } catch (e) {
    return /index\.html\/?$/.test(String(url)) || /Travel-app\/?$/.test(String(url));
  }
}

function isAppJs(url) {
  try {
    const u = new URL(url);
    return /\/js\/[^/]+\.js$/.test(u.pathname);
  } catch (e) {
    return /\/js\/[^/?]+\.js(\?|$)/.test(String(url));
  }
}

function networkFirst(req) {
  return fetch(req).then(function (res) {
    if (res && res.ok && req.url.startsWith(self.location.origin)) {
      const copy = res.clone();
      caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (cached) {
      return cached || caches.match('./index.html');
    });
  });
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

  // Network-first for app shell JS/CSS + index.html so dropdown/map fixes land quickly
  function isAppCss(url) {
    try {
      const u = new URL(url);
      return /\/css\/[^/]+\.css$/.test(u.pathname);
    } catch (e) {
      return /\/css\/[^/?]+\.css(\?|$)/.test(String(url));
    }
  }
  if (isAppJs(req.url) || isShellDoc(req.url) || isAppCss(req.url)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Cache-first for static assets (icons, css, manifest)
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
