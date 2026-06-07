/* Service worker — caches the static app shell for fast loads / installability.
   API requests always go to the network (this is a cloud-synced app). */
const CACHE = 'ca-cloud-v13';
const ASSETS = [
  './', './index.html', './styles.css', './auth.css', './config.js', './app.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(a => c.add(a)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Never cache API calls.
  if (e.request.method !== 'GET' || url.pathname.includes('/api/')) return;
  // Network-first: always try fresh, fall back to cache when offline.
  e.respondWith(
    fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
