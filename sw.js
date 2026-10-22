// Guarda o app para abrir rápido; a lista de carros sempre vem da rede primeiro.
const CACHE = 'radar-v4';
const APP = ['./', 'index.html', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('leads.enc.json')) {
    e.respondWith(fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put('leads.enc.json', copia));
      return r;
    }).catch(() => caches.match('leads.enc.json')));
    return;
  }
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
