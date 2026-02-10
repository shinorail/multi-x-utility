const CACHE_NAME = 'sn-utility-v2';
const ASSETS = [
  'index.html',
  'menu.html',
  'calc.html',
  'timer.html',
  'sw.html',
  'alarm.html',
  'convert.html',
  'pass.html',
  'qr.html',
  'level.html',
  'manifest.json',
  'icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
