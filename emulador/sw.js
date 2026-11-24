// Service worker: SIEMPRE intenta la red primero (así cada actualización llega al instante)
// y usa la caché solo si no hay internet.
const C = 'jemu-cache';
const FILES = ['./', 'index.html', 'icon.svg', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];

self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.url.includes('version.json')) return; // siempre directo a la red
  e.respondWith((async () => {
    const c = await caches.open(C);
    try {
      const r = await fetch(req, { cache: 'no-store' });
      if (r.ok) c.put(req, r.clone());
      return r;
    } catch (_) {
      return (await c.match(req, { ignoreSearch: true })) || (await c.match('./')) || Response.error();
    }
  })());
});
