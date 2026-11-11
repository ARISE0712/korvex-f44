// Offline-Speicher mit automatischem Update.
// Spielseite: zuerst aus dem Netz (dann ist immer die neueste Fassung da), ohne Netz die zuletzt geladene.
const CACHE = 'frontlinie-23ddf999735c';
const FILES = ['./index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const page = req => req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
const timeout = (p, ms) => new Promise((ok, no) => { const t = setTimeout(() => no(new Error('langsam')), ms); p.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); no(e); }); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (page(req)) {
    e.respondWith(timeout(fetch('./index.html', { cache: 'no-store' }), 6000).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r; }
      throw new Error('Status ' + r.status);
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
