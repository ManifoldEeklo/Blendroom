/* Blendroom service worker: works offline after the first visit */
const VERSION = 'blendroom-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
const CDN = /(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$|(^|\.)cdnjs\.cloudflare\.com$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE).then(() =>
    c.add(new Request('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js', { mode: 'no-cors' })).catch(() => {})
  )).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    // app files: network first so updates arrive, cache as fallback for offline use
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (CDN.test(url.hostname)) {
    // fonts and the MP3 encoder: cache first
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req); if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res;
    }));
  }
});
