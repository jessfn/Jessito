// Service worker de Jessito Emu
// - La app (HTML, JS): SIEMPRE red primero, para que cada actualización llegue al instante; caché solo sin internet.
// - Los motores de emulación (cdn.emulatorjs.org): caché primero, para que los juegos arranquen al instante
//   y funcionen sin internet; se actualizan en segundo plano.
const C = 'jemu-cache';
const CORES = 'jemu-motores';
const FILES = ['./', 'index.html', 'ecm.js', 'ejs.html', 'icon.svg', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];
const CDN = 'https://cdn.emulatorjs.org/';

self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== CORES).map(k => caches.delete(k)))).then(() => self.clients.claim())));

async function motores(req) {
  const c = await caches.open(CORES);
  const key = req.url.split('#')[0];
  const hit = await c.match(key);
  const net = fetch(key, { mode: 'cors', credentials: 'omit' })
    .then(r => { if (r.ok && r.status === 200) c.put(key, r.clone()); return r; })
    .catch(() => null);
  if (hit) { net.catch(() => {}); return hit; }   // instantáneo desde la caché; se refresca en segundo plano
  return (await net) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.startsWith(CDN)) { if (!req.headers.has('range')) e.respondWith(motores(req)); return; }
  if (new URL(req.url).origin !== location.origin) return;
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

// La app pide precargar motores: {precargar: [urls]}
self.addEventListener('message', e => {
  const urls = e.data && e.data.precargar; if (!Array.isArray(urls)) return;
  e.waitUntil(caches.open(CORES).then(async c => {
    for (const u of urls) { if (!u.startsWith(CDN) || await c.match(u)) continue;
      try { const r = await fetch(u, { mode: 'cors', credentials: 'omit' }); if (r.ok) await c.put(u, r); } catch (_) {} }
  }));
});
